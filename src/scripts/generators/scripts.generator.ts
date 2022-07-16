import debug, { IDebugger } from 'debug';
import Script from '../models/scripts.model';
import { IIdentity } from '../../common/interfaces/identity.interface';
import { ModuleTypes } from '../../common/enums/module.enum';
import { IGenerate } from '../../common/interfaces/generate.interace';
import { IScript, IScriptData, IScriptMetadata, IScriptLanguage } from '../interfaces/scripts.interface';
import ProgressBar from 'progress';
import CLDRUTIL from '../../common/util/common.util';

const log: IDebugger = debug('app:scripts-generator');

const availableLocales: string[] = CLDRUTIL.getAvailableLocales();

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: availableLocales.length * 2})

import scriptMetadata from "cldr-core/scriptMetadata.json";
import languageData from "cldr-core/supplemental/languageData.json";

export default class ScriptsGenerator implements IGenerate {
  constructor(){
    log('Created instance of ScriptsGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'scripts';

    log('Seeding script modules...');
    if (Script.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await Script.db.dropCollection(collection).catch(e => log(e.message));
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
    return `Scripts: ${inserted} documents inserted.`;
  }

  private async insert(localeData: IScript[]): Promise<string[]> {
    const insertions = await Script.insertMany(localeData);
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

  private getScriptLanguages(tag): IScriptLanguage[] {
    const languages = Object.keys(languageData.supplemental.languageData)
      .filter(tag => !tag.includes('alt')); // exclude alt when getting language tags
    const languageEntries: IScriptLanguage[] = [];

    languages.map(language => {
      const primary = languageData.supplemental.languageData[language];
      const secondary = languageData.supplemental.languageData[`${language}-alt-secondary`];
  
      if (primary && primary._scripts) {
        primary._scripts.map(script => {
          if (script === tag) {
            languageEntries.push({tag: language, scriptStatus: 'primary'})
          }
        });
      }
      if (secondary && secondary._scripts) {
        secondary._scripts.map(script => {
          if (script === tag) {
            languageEntries.push({tag: language, scriptStatus: 'secondary'})
          }
        });
      }
    })
    return languageEntries;
  }

  private getScriptDisplayName(data, tag) {
    return data[tag];
  }

  private getScriptMetadata(tag): IScriptMetadata | Record<string, never> {
    const d = scriptMetadata.scriptMetadata[tag];

    if (!d) {
      return {};
    }

    return {
      rank: d.rank,
      age: {
        m_version: d.age.m_version_
      },
      sampleChar: d.sampleChar,
      idUsage: d.idUsage,
      rtl: d.rtl === "NO" ? false : true,
      lbLetters: d.lbLetters === "NO" ? false : true,
      hasCase: d. hasCase === "NO" ? false : true,
      shapingReq: d.shapingReq === "NO" ? false : true,
      ime: d.ime === "NO" ? false : true,
      density: d.density,
      originCountry: d.originCountry,
      likelyLanguage: d.likelyLanguage
    }
  }

  private getMain(data, tag): IScriptData {
    return {
      tag: tag,
      displayName: this.getScriptDisplayName(data, tag),
      metadata: this.getScriptMetadata(tag),
      languages: this.getScriptLanguages(tag)
    }
  }

  async generateLocaleData(locale: string): Promise<IScript[]> {
    const scriptNamesData = CLDRUTIL.getLocaleData('localenames', 'scripts', locale);
    const scripts = Object.keys(scriptNamesData.main[locale].localeDisplayNames.scripts)
      .filter(l => !l.includes('alt')); // exclude alt names

    const output: IScript[] = scripts.map(script => {
      return {
        tag: locale,
        identity: this.getIdentity(scriptNamesData, locale),
        moduleType: ModuleTypes.SCRIPTS,
        main: this.getMain(
          scriptNamesData.main[locale].localeDisplayNames.scripts,
          script
        )
      }
    });
    return output;
  }
}