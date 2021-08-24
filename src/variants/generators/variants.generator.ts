import debug, { IDebugger } from 'debug';
import availableLocales from 'cldr-core/availableLocales.json';
import Variant from '../models/variants.model';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { IIdentity } from '../../common/interfaces/identity.interface';
import { ModuleTypes } from '../../common/enums/module.enum';
import { IGenerate } from '../../common/interfaces/generate.interace';
import { IVariant, IVariantData } from '../interfaces/variants.interface';
import ProgressBar from 'progress';

const log: IDebugger = debug('app:variants-generator');

const locales: string[] = availableLocales.availableLocales.modern;

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: locales.length * 2})

const NODE_MODULES = '../../../../node_modules';

export default class VariantsGenerator implements IGenerate {
  constructor(){
    log('Created instance of VariantsGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'variants';

    log('Seeding variant modules...');
    if (Variant.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await Variant.db.dropCollection(collection).catch(e => log(e.message));
    }
    
    const results: string[][] = [];

    for (let i = 0; i < locales.length; i++) {
      const locale = locales[i];
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
    return `Variants: ${inserted} documents inserted.`;
  }

  private async insert(localeData: IVariant[]): Promise<string[]> {
    const insertions = await Variant.insertMany(localeData);
    return insertions.map(record => {
      return record._id;
    });
  }

  private async getData(filePath: string, locale: string) {
    const localized = filePath.replace('{{locale}}', locale)
    const resolvedPath = resolve( __filename, localized);
    const contents = await readFile(resolvedPath, 'utf-8');
    try {
      return JSON.parse(contents);
    } catch {
      return {};
    }
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

  private getVariantDisplayName(data, tag) {
    return data[tag];
  }

  private getMain(data, tag): IVariantData {
    return {
      tag: tag,
      displayName: this.getVariantDisplayName(data, tag)
    }
  }

  async generateLocaleData(locale: string): Promise<IVariant[]> {
    const variantNamesData = await this.getData(`${NODE_MODULES}/cldr-localenames-modern/main/{{locale}}/variants.json`, locale);
    const variants = Object.keys(variantNamesData.main[locale].localeDisplayNames.variants)
      .filter(l => !l.includes('alt')); // exclude alt names

    const output: IVariant[] = variants.map(variant => {
      return {
        tag: locale,
        identity: this.getIdentity(variantNamesData, locale),
        moduleType: ModuleTypes.VARIANTS,
        main: this.getMain(
          variantNamesData.main[locale].localeDisplayNames.variants,
          variant
        )
      }
    });
    return output;
  }
}