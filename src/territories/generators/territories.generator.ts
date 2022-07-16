import debug, { IDebugger } from 'debug';
import Territory from '../models/territories.model';
import { IIdentity } from '../../common/interfaces/identity.interface';
import { ModuleTypes } from '../../common/enums/module.enum';
import { IGenerate } from '../../common/interfaces/generate.interace';
import { ITerritory, ITerritoryAltDisplayName, ITerritoryCurrency, ITerritoryData, ITerritoryLanguage } from '../interfaces/territories.interface';
import ProgressBar from 'progress';
import CLDRUTIL from '../../common/util/common.util';

const log: IDebugger = debug('app:territories-generator');

const availableLocales: string[] = CLDRUTIL.getAvailableLocales();

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: availableLocales.length * 2})

import territoryInfo from "cldr-core/supplemental/territoryInfo.json";
import territoryContainment from "cldr-core/supplemental/territoryContainment.json";
import currencyData from "cldr-core/supplemental/currencyData.json";

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

export default class TerritoriesGenerator implements IGenerate {
  constructor(){
    log('Created instance of TerritoriesGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'territories';

    log('Seeding territory modules...');
    if (Territory.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await Territory.db.dropCollection(collection).catch(e => log(e.message));
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
    return `Territories: ${inserted} documents inserted.`;
  }

  private async insert(localeData: ITerritory[]): Promise<string[]> {
    const insertions = await Territory.insertMany(localeData);
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

  private getTerritoryDisplayName(data, tag: string): string {
    return data[tag];
  }

  private getTerritoryAltDisplayNames(data, tag: string): ITerritoryAltDisplayName[] {
    const altDisplayNames: ITerritoryAltDisplayName[] = [];
    Object.keys(data).map(territoryKey => {
      if (territoryKey.includes('alt') && territoryKey.split('-')[0] === tag) {
        altDisplayNames.push({
          type: territoryKey.split('-').pop() || 'undefined',
          value: data[territoryKey]
        });
      }
    });
    return altDisplayNames;
  }

  private getParentTerritories(tag: string): string[] {
    const containers = Object.keys(territoryContainment.supplemental.territoryContainment).filter(key => {
      return !key.includes['status-deprecated'];
    });
    const parents: string[] = [];
    containers.map(container => {
      const dArray = territoryContainment.supplemental.territoryContainment[container]._contains;
      let parent: string;
      if(dArray.includes(tag)) {
        if (
          container.includes[('status-grouping')]) {
          parent = container.split('-')[0];
        } else {
          parent = container;
        }
        parents.push(parent);
      }
    });
    return parents;
  }

  private getContainedTerritories(tag: string): string[] {
    const contained: string[] = territoryContainment.supplemental.territoryContainment[tag]?._contains || [];
    const grouping = territoryContainment.supplemental.territoryContainment[`${tag}-status-grouping`];
    if(grouping) {
      contained.push(grouping._contains); 
    }
    return contained.flat().filter(onlyUnique);
  }

  private getTerritoryLanguages(tag): ITerritoryLanguage[] {
    const d = territoryInfo.supplemental.territoryInfo[tag]?.languagePopulation || {};
    const languages = Object.keys(d);

    return languages.map(language => {
      return {
        tag: language,
        populationPercent: d[language]._populationPercent && (parseInt(d[language]._populationPercent, 10)/100),
        literacyPercent: d[language]._literacyPercent && (parseInt(d[language]._literacyPercent, 10)/10),
        writingPercent: d[language]._writingPercent && (parseInt(d[language]._writingPercent, 10)/100),
        officialStatus: d[language]._officialStatus
      }
    });
  }

  private getTerritoryCurrencies(tag: string): ITerritoryCurrency[] {
    const currencies = currencyData.supplemental.currencyData.region[tag] || [];
    const tCurrencies: ITerritoryCurrency[] = [];
    currencies.map(entry => {
      const code = Object.keys(entry)[0];
      const c = {
        code: code,
        from: entry[code]._from,
        to: entry[code]._to,
        isTender: entry[code]._tender === "false" ? false : true
      }
      tCurrencies.push(c);
    });
    return tCurrencies;
  }

  private getMain(data, tag): ITerritoryData {
    const d = territoryInfo.supplemental.territoryInfo[tag];
    return {
      tag: tag,
      displayName: this.getTerritoryDisplayName(data, tag),
      altDisplayNames: this.getTerritoryAltDisplayNames(data, tag),
      gdp: d && d._gdp,
      population: d && d._population,
      literacyPercent: d && d._literacyPercent && (parseInt(territoryInfo.supplemental.territoryInfo[tag]?._literacyPercent,10)/100),
      parentTerritories: this.getParentTerritories(tag),
      contains: this.getContainedTerritories(tag),
      languages: this.getTerritoryLanguages(tag),
      currencies: this.getTerritoryCurrencies(tag)
    }
  }

  async generateLocaleData(locale: string): Promise<ITerritory[]> {
    const territoryNamesData = CLDRUTIL.getLocaleData('localenames', 'territories', locale);
    const territories = Object.keys(territoryNamesData.main[locale].localeDisplayNames.territories)
      .filter(l => !l.includes('alt')); // exclude alt names

    const output: ITerritory[] = territories.map(territory => {
      return {
        tag: locale,
        identity: this.getIdentity(territoryNamesData, locale),
        moduleType: ModuleTypes.TERRITORIES,
        main: this.getMain(
          territoryNamesData.main[locale].localeDisplayNames.territories,
          territory
        )
      }
    });
    return output;
  }
}