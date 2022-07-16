import debug, { IDebugger } from 'debug';
import Extension from '../models/extensions.model';
import { IIdentity } from '../../common/interfaces/identity.interface';
import { ModuleTypes } from '../../common/enums/module.enum';
import { IGenerate } from '../../common/interfaces/generate.interace';
import { IExtension, IExtensionData } from '../interfaces/extensions.interface';
import ProgressBar from 'progress';
import CLDRUTIL from '../../common/util/common.util';

const log: IDebugger = debug('app:extensions-generator');

const availableLocales: string[] = CLDRUTIL.getAvailableLocales();

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: availableLocales.length * 2})

export default class ExtensionsGenerator implements IGenerate {
  constructor(){
    log('Created instance of ExtensionsGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'extensions';

    log('Seeding extension modules...');
    if (Extension.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await Extension.db.dropCollection(collection).catch(e => log(e.message));
    }
    
    const results: string[][] = [];

    for (let i = 0; i < availableLocales.length; i++) {
      const locale = availableLocales[i];
      const data = await this.generateLocaleData(locale)
      bar.tick({
        module: collection,
        locale: locale,
        mode: 'generated'
      });
      results.push(await this.insert(data));  
      bar.tick({
        module: collection,
        locale: locale,
        mode: 'inserted'
      });
    }

    const inserted = results.reduce((acc, val) => acc.concat(val), []).length;
    return `Extensions: ${inserted} documents inserted.`;
  }

  private async insert(localeData: IExtension[]): Promise<string[]> {
    const insertions = await Extension.insertMany(localeData);
    return insertions.map(record => {
      return record._id.toString();
    });
  }

  private getIdentity(data, locale): IIdentity {
    const identityData = data.main[locale].identity;

    return {
      language: identityData.language,
      script: identityData.script,
      territory: identityData.territory,
      variant: identityData.variant,
      versions: {
        cldr: identityData.version._cldrVersion,
        unicode: identityData.version._unicodeVersion
      }
    };
  }

  private getExtensionDisplayName(data, key) {
    return data.keys[key];
  }

  private getMain(data, key): IExtensionData {
    return {
      key: key,
      displayName: this.getExtensionDisplayName(data, key),
      types: data.types[key]
    }
  }

  async generateLocaleData(locale: string): Promise<IExtension[]> {
    const extensionsNameData = CLDRUTIL.getLocaleData('localenames', 'localeDisplayNames', locale);
    const keys = Object.keys(extensionsNameData.main[locale].localeDisplayNames.keys)
      .filter(l => !l.includes('alt')); // exclude alt names

    const output: IExtension[] = keys.map(key => {
      return {
        tag: locale,
        identity: this.getIdentity(extensionsNameData, locale),
        moduleType: ModuleTypes.EXTENSIONS,
        main: this.getMain(
          extensionsNameData.main[locale].localeDisplayNames,
          key
        )
      }
    });
    return output;
  }
}