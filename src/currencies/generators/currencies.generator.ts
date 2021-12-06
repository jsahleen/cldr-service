import debug, { IDebugger } from 'debug';
import Currency from '../models/currencies.model';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { IIdentity } from '../../common/interfaces/identity.interface';
import { ModuleTypes } from '../../common/enums/module.enum';
import { IPluralKeys } from '../../common/interfaces/pluralkeys.interface';
import { IGenerate } from '../../common/interfaces/generate.interace';
import { ICurrency, ICurrencyData, ICurrencySymbols, ICurrencyFractions, ICurrencyTerritory } from '../interfaces/currencies.interface';
import ProgressBar from 'progress';

const log: IDebugger = debug('app:currency-generator');

const availableLocales: string[] = CLDRUTIL.getAvailableLocales();

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: availableLocales.length * 2})

const NODE_MODULES = '../../../../node_modules';

import currencyData from 'cldr-core/supplemental/currencyData.json';
import CLDRUTIL from '../../common/util/common.util';

export default class CurrencyGenerator implements IGenerate {
  constructor(){
    log('Created instance of CurrencyGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'currencies';

    log('Seeding currency modules...');
    if (Currency.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await Currency.db.dropCollection(collection).catch(e => log(e.message));
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
    return `Currencies: ${inserted} documents inserted.`;
  }

  private async insert(localeData: ICurrency[]): Promise<string[]> {
    const insertions = await Currency.insertMany(localeData);
    return insertions.map(record => {
      return record._id;
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

  private getPlurals(dataBlock): IPluralKeys {
    return {
      zero: dataBlock[`displayName-count-zero`],
      one: dataBlock[`displayName-count-one`],
      two: dataBlock[`displayName-count-two`],
      few: dataBlock[`displayName-count-few`],
      many: dataBlock[`displayName-count-many`],
      other: dataBlock[`displayName-count-other`],
    };
  }
  
  private getFractions(fractionsData): ICurrencyFractions {
    return {
      rounding: (fractionsData && fractionsData._rounding) || 0,
      digits: (fractionsData && fractionsData._digits) || 2,
      cashRounding: (fractionsData && fractionsData._cashRounding),
      cashDigits: (fractionsData && fractionsData._cashDigits)
    };
  }

  private isCurrent(territoriesData, code): boolean {
    const territories = Object.keys(territoriesData);
    let output = false;
    territories.map(territory => {
      const dataArray = territoriesData[territory];
      dataArray.map(d => {
        if (d[code] && !d[code]['_to']) {
          output = true;
        }
      });
    });
    return output;
  }

  private getTerritories(territoriesData, code): ICurrencyTerritory[] {
    const territories = Object.keys(territoriesData);
    const territoriesArray: ICurrencyTerritory[] = [];
    territories.map(territory => {
      const dataArray = territoriesData[territory];
      dataArray.map(d => {
        if (d[code]) {
          const output = {
            tag: territory,
            from: d[code]['_from'],
            to: d[code]['_to'],
            isTender: d[code]['_tender'] || true,
          }
          territoriesArray.push(output);
        }
      });
    });
    return territoriesArray;
  }

  private getMain(currenciesData, fractionsData, territoriesData, code): ICurrencyData {
    return {
      code: code,
      displayName: currenciesData[code].displayName,
      plurals: this.getPlurals(currenciesData[code]),
      symbols: this.getCurrencySymbols(currenciesData[code]),
      fractions: this.getFractions(fractionsData[code]),
      isCurrent: this.isCurrent(territoriesData, code),
      territories: this.getTerritories(territoriesData, code)
    }
  }

  private getCurrencySymbols(currencyData): ICurrencySymbols {
    return {
      standard: currencyData.symbol,
      narrow: currencyData['symbol-alt-narrow'] || currencyData.symbol
    }
  }

  async generateLocaleData(locale: string): Promise<ICurrency[]> {
    const currenciesDataList = CLDRUTIL.getLocaleData('numbers', 'currencies', locale);

    const fractionsData = currencyData.supplemental.currencyData.fractions;
    const territoriesData = currencyData.supplemental.currencyData.region;

    const currenciesData = currenciesDataList.main[locale].numbers.currencies;
    const codes = Object.keys(currenciesData);

    const output: ICurrency[] = codes.map(code => {
      return {
        tag: locale,
        identity: this.getIdentity(currenciesDataList, locale),
        moduleType: ModuleTypes.CURRENCIES,
        main: this.getMain(currenciesData, fractionsData, territoriesData, code)
      }
    });
    return output;
  }
}