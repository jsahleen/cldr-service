import debug, { IDebugger } from 'debug';
import availableLocales from 'cldr-core/availableLocales.json';
import Language from '../models/languages.model';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { IIdentity } from '../../common/interfaces/identity.interface';
import { ModuleTypes } from '../../common/enums/module.enum';
import { IGenerate } from '../../common/interfaces/generate.interace';
import { ILanguage, ILanguageData, ILanguageScript, ILanguageTerritory, IPluralRanges, IPluralRules } from '../interfaces/languages.interface';
import ProgressBar from 'progress';

const log: IDebugger = debug('app:language-generator');

const locales: string[] = availableLocales.availableLocales.modern;

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: locales.length * 2})

const NODE_MODULES = '../../../../node_modules';

import languageFamilyData from 'cldr-core/supplemental/languageGroups.json';
import pluralRulesData from 'cldr-core/supplemental/plurals.json'
import pluralRangesData from 'cldr-core/supplemental/pluralRanges.json'
import ordinalRulesData from 'cldr-core/supplemental/ordinals.json'
import languagesData from 'cldr-core/supplemental/languageData.json'

export default class LanguagesGenerator implements IGenerate {
  constructor(){
    log('Created instance of LanguagesGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'languages';

    log('Seeding language modules...');
    if (Language.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await Language.db.dropCollection(collection).catch(e => log(e.message));
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
    return `${inserted} documents inserted.`;
  }

  private async insert(localeData: ILanguage[]): Promise<string[]> {
    const insertions = await Language.insertMany(localeData);
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

  private getLanguagePluralRanges(pRData, languageSubTag): IPluralRanges | Record<string, never> {
    const data = pRData.supplemental.plurals[languageSubTag];
    if (!data) {
      return {};
    }

    return {
      'start-zero-end-zero': data['pluralRange-start-zero-end-zero'],
      'start-zero-end-one': data['pluralRange-start-zero-end-one'],
      'start-zero-end-two': data['pluralRange-start-zero-end-two'],
      'start-zero-end-few': data['pluralRange-start-zero-end-few'],
      'start-zero-end-many': data['pluralRange-start-zero-end-many'],
      'start-zero-end-other': data['pluralRange-start-zero-end-other'],
      'start-one-end-zero': data['pluralRange-start-one-end-zero'],
      'start-one-end-one': data['pluralRange-start-one-end-one'],
      'start-one-end-two': data['pluralRange-start-one-end-two'],
      'start-one-end-few': data['pluralRange-start-one-end-few'],
      'start-one-end-many': data['pluralRange-start-one-end-many'],
      'start-one-end-other': data['pluralRange-start-one-end-other'],
      'start-two-end-zero': data['pluralRange-start-two-end-zero'],
      'start-two-end-one': data['pluralRange-start-two-end-one'],
      'start-two-end-two': data['pluralRange-start-two-end-two'],
      'start-two-end-few': data['pluralRange-start-two-end-few'],
      'start-two-end-many': data['pluralRange-start-two-end-many'],
      'start-two-end-other': data['pluralRange-start-two-end-other'],
      'start-few-end-zero': data['pluralRange-start-few-end-zero'],
      'start-few-end-one': data['pluralRange-start-few-end-one'],
      'start-few-end-two': data['pluralRange-start-few-end-two'],
      'start-few-end-few': data['pluralRange-start-few-end-few'],
      'start-few-end-many': data['pluralRange-start-few-end-many'],
      'start-few-end-other': data['pluralRange-start-few-end-other'],
      'start-many-end-zero': data['pluralRange-start-many-end-zero'],
      'start-many-end-one': data['pluralRange-start-many-end-one'],
      'start-many-end-two': data['pluralRange-start-many-end-two'],
      'start-many-end-few': data['pluralRange-start-many-end-few'],
      'start-many-end-many': data['pluralRange-start-many-end-many'],
      'start-many-end-other': data['pluralRange-start-many-end-other'],
      'start-other-end-zero': data['pluralRange-start-other-end-zero'],
      'start-other-end-one': data['pluralRange-start-other-end-one'],
      'start-other-end-two': data['pluralRange-start-other-end-two'],
      'start-other-end-few': data['pluralRange-start-other-end-few'],
      'start-other-end-many': data['pluralRange-start-other-end-many'],
      'start-other-end-other': data['pluralRange-start-other-end-other'],
    }
  }


  private getLanguagePluralRules(cardinal, ordinal, language): IPluralRules {
    const d1 = cardinal.supplemental['plurals-type-cardinal'][language];
    const d2 = ordinal.supplemental['plurals-type-ordinal'][language];
    let c = {}, o = {};

    if (d1) {
      c = {
        zero: d1[`pluralRule-count-zero`],
        one: d1[`pluralRule-count-one`],
        two: d1[`pluralRule-count-two`],
        few: d1[`pluralRule-count-few`],
        many: d1[`pluralRule-count-many`],
        other: d1[`pluralRule-count-other`],
      };  
    }

    if (d2) {
      o = {
        zero: d2[`pluralRule-count-zero`],
        one: d2[`pluralRule-count-one`],
        two: d2[`pluralRule-count-two`],
        few: d2[`pluralRule-count-few`],
        many: d2[`pluralRule-count-many`],
        other: d2[`pluralRule-count-other`],
      };  
    }

    return {
      cardinal: c,
      ordinal: o
    }
  }

  private getLanguageScripts(data, languageSubTag): ILanguageScript[] {
    const primary = data.supplemental.languageData[languageSubTag];
    const secondary = data.supplemental.languageData[`${languageSubTag}-alt-secondary`];
    const scripts: ILanguageScript[] = [];

    if (primary && primary._scripts) {
      primary._scripts.map(script => {
        scripts.push({tag: script, scriptStatus: 'primary'});
      })
    }
    if (secondary && secondary._scripts) {
      secondary._scripts.map(script => {
        scripts.push({tag: script, scriptStatus: 'secondary'});
      })
    }
    return scripts;
  }

  private getLanguageTerritories(data, languageSubTag): ILanguageTerritory[] {
    const primary = data.supplemental.languageData[languageSubTag];
    const secondary = data.supplemental.languageData[`${languageSubTag}-alt-secondary`];
    const territories: ILanguageTerritory[] = [];

    if (primary && primary._territories) {
      primary._territories.map(territory => {
        territories.push({tag: territory, languageStatus: 'primary'});
      });
    }
    if (secondary && secondary._territories) {
      secondary._territories.map(territory => {
        territories.push({tag: territory, languageStatus: 'secondary'});
      });
    }
    return territories;
  }

  private getLanguageFamily(languageFamilyData, languageSubTag) {
    const data = languageFamilyData.supplemental.languageGroups;
    const groups = Object.keys(data);
    let group = 'und';
    groups.map(g => {
      const gArray = data[g].split(' ');
      if (gArray.includes(languageSubTag)) {
        group = g;
      }
    });
    return group;
  }

  private getLanguageDisplayName(namesData, languageTag) {
    return namesData[languageTag];
  }

  private getMain(
    namesData,
    familyData,
    pData,
    oData,
    pRData,
    lData,
    languageTag
  ): ILanguageData {
    const languageSubTag = languageTag.split('-').shift();
    return {
      tag: languageTag,
      displayName: this.getLanguageDisplayName(namesData, languageTag),
      languageFamily: this.getLanguageFamily(familyData, languageSubTag),
      pluralRules: this.getLanguagePluralRules(pData, oData, languageSubTag),
      pluralRanges: this.getLanguagePluralRanges(pRData, languageSubTag),
      scripts: this.getLanguageScripts(lData, languageSubTag),
      territories: this.getLanguageTerritories(lData, languageSubTag)
    }
  }

  async generateLocaleData(locale: string): Promise<ILanguage[]> {
    const languageNamesData = await this.getData(`${NODE_MODULES}/cldr-localenames-modern/main/{{locale}}/languages.json`, locale);
    const languages = Object.keys(languageNamesData.main[locale].localeDisplayNames.languages)
      .filter(l => !l.includes('alt'));

    const output: ILanguage[] = languages.map(language => {
      return {
        tag: locale,
        identity: this.getIdentity(languageNamesData, locale),
        moduleType: ModuleTypes.LANGUAGES,
        main: this.getMain(
          languageNamesData.main[locale].localeDisplayNames.languages,
          languageFamilyData,
          pluralRulesData,
          ordinalRulesData,
          pluralRangesData,
          languagesData,
          language
        )
      }
    });
    return output;
  }
}