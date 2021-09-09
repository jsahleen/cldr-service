import debug, { IDebugger } from 'debug';
import availableLocales from 'cldr-core/availableLocales.json';
import Locale from '../models/locales.model';
import { ModuleTypes } from '../../common/enums/module.enum';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { IIdentity } from '../../common/interfaces/identity.interface';
import { IGenerate } from '../../common/interfaces/generate.interace';
import { ILocale, ILocaleData, ILocalePatterns } from '../interfaces/locales.interface';

import Language from '../../languages/models/languages.model';
import Script from '../../scripts/models/scripts.model';
import Territory from '../../territories/models/territories.model';
import Variant from '../../variants/models/variants.model';

import * as bcp47 from 'bcp47';

import ProgressBar from 'progress';

import parentLocalesData from 'cldr-core/supplemental/parentLocales.json';
import likelySubtagsData from 'cldr-core/supplemental/likelySubtags.json';

import { ObjectId } from 'mongoose';

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

  private getLikelySubtags(tag) {
    let lst = likelySubtagsData.supplemental.likelySubtags[tag];

    if (!lst) {
      const parsed = bcp47.parse(tag);
      const language = parsed.langtag.language.language;
      let script = parsed.langtag.script;
      let territory = parsed.langtag.region;

      const lst2 = likelySubtagsData.supplemental.likelySubtags[language];
      
      if (!script) {
        script = bcp47.parse(lst2).langtag.script;
      }

      if (!territory) {
        territory = bcp47.parse(lst2).langtag.region;
      }

      lst = [language, script, territory].join('-');
    }

    return lst;
  }

  private getParentLocale(tag): string {
    let pLocale = parentLocalesData.supplemental.parentLocales.parentLocale[tag];
    if (!pLocale) {
      const likelySubtags = this.getLikelySubtags(tag).split('-') || [];
      while (likelySubtags.length > 0) {
        const candidate = likelySubtags.join('-');
        if (parentLocalesData.supplemental.parentLocales.parentLocale[candidate]) {
          pLocale = parentLocalesData.supplemental.parentLocales.parentLocale[candidate];
          break;
        }
        likelySubtags.pop();
      }
    }
    return pLocale || 'root';
  }

  private async getLocaleLanguage(tag: string, locale: string): Promise<ObjectId> {
    const parsed = bcp47.parse(tag);
    const langTag = parsed.langtag.language.language;
    
    const language = await Language.findOne({$and: [{'main.tag': langTag}, {tag: locale}]}).select('_id').exec();
    return language?._id;
  }

  private async getLocaleScript(tag: string, locale: string): Promise<ObjectId> {
    const parsed = bcp47.parse(tag);
    const scriptTag = parsed.langtag.script;

    const script = await Script.findOne({$and: [{'main.tag': scriptTag}, {tag: locale}]}).exec();
    return script?._id
  }

  private async getLocaleTerritory(tag: string, locale: string): Promise<ObjectId> {
    const parsed = bcp47.parse(tag);
    const territoryTag = parsed.langtag.region;

    const territory = await Territory.findOne({$and: [{'main.tag': territoryTag}, {tag: locale}]}).exec();
    return territory?._id
  }

  private async getLocaleVariant(tag: string, locale: string): Promise<ObjectId> {
    const parsed = bcp47.parse(tag);
    const variantTag = parsed.langtag.variant;

    const variant = await Variant.findOne({$and: [{'main.tag': variantTag}, {tag: locale}]}).exec();
    return variant?._id
  }

  private async getMain(lNameData, tag, locale): Promise<ILocaleData> {
    return {
      tag: tag,
      parentLocale: this.getParentLocale(tag),
      likelySubtags: this.getLikelySubtags(tag),
      patterns: this.getLocalePatterns(lNameData, locale),
      language: undefined,
      script: undefined,
      territory: undefined,
      variant: undefined,
    }
  }
  async generateLocaleData(locale: string): Promise<ILocale[]> {
    const localeNamesData = await this.getData(`${NODE_MODULES}/cldr-localenames-modern/main/{{locale}}/localeDisplayNames.json`, locale);
    const tags = availableLocales.availableLocales.modern.filter(tag => tag !== 'root');

    const output = tags.map(async tag => {
      const module = {
        tag: locale,
        identity: this.getIdentity(localeNamesData, locale),
        moduleType: ModuleTypes.LOCALES,
        main: await this.getMain(localeNamesData, tag, locale)
      };
  
      return module;  
    });

    return Promise.all(output).then();
  }
}