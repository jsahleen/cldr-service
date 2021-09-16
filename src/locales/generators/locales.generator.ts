import debug, { IDebugger } from 'debug';
import availableLocales from 'cldr-core/availableLocales.json';
import Locale from '../models/locales.model';
import { ModuleTypes } from '../../common/enums/module.enum';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { IIdentity } from '../../common/interfaces/identity.interface';
import { IGenerate } from '../../common/interfaces/generate.interace';
import { ILocale, ILocaleData, ILocalePatterns } from '../interfaces/locales.interface';

import ProgressBar from 'progress';

const log: IDebugger = debug('app:locales-generator');

const locales: string[] = availableLocales.availableLocales.modern;

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: locales.length * 2})

const NODE_MODULES = '../../../../node_modules';

export default class LocalesGenerator implements IGenerate {
  constructor(){
    log('Created instance of LocalesGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'locales';

    log('Seeding locale modules...');
    if (Locale.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await Locale.db.dropCollection(collection).catch(e => log(e.message));
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
    return `Locales: ${inserted} documents inserted.`;
  }

  private async insert(localeData: ILocale[]): Promise<string[]> {
    const insertions = await Locale.insertMany(localeData);
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

  private getIdentity(data, tag): IIdentity {
    const identityData = data.main[tag].identity;

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

  private getLocalePatterns(data, tag): ILocalePatterns {
    return {
      display: {
        standard: data.main[tag]?.localeDisplayNames.localeDisplayPattern.localePattern,
        separator: data.main[tag]?.localeDisplayNames.localeDisplayPattern.localeSeparator,
        keyType: data.main[tag]?.localeDisplayNames.localeDisplayPattern.localeKeyTypePattern
      },
      code: data.main[tag]?.localeDisplayNames.codePatterns
    }
  }

  private async getMain(lNameData, locale): Promise<ILocaleData> {
    return {
      tag: undefined,
      parentLocale: undefined,
      likelySubtags: undefined,
      patterns: this.getLocalePatterns(lNameData, locale),
      language: undefined,
      script: undefined,
      territory: undefined,
      variants: undefined,
    }
  }
  async generateLocaleData(locale: string): Promise<ILocale[]> {
    const localeNamesData = await this.getData(`${NODE_MODULES}/cldr-localenames-modern/main/{{locale}}/localeDisplayNames.json`, locale);

    const module = {
      tag: locale,
      identity: this.getIdentity(localeNamesData, locale),
      moduleType: ModuleTypes.LOCALES,
      main: await this.getMain(localeNamesData, locale)
    };
  
    // Annoying typescript hack
    return Promise.all([module]).then();
  }
}