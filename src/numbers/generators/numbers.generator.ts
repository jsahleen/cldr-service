import debug, { IDebugger } from 'debug';
import availableLocales from 'cldr-core/availableLocales.json';
import NumberSystem from '../models/numbers.model';
import { ICurrencyPatterns, IDecimalPatterns, IMinimalPairs, IMiscPatterns, INSData, INumberPatterns, INumberSystem, INumberSystemPatterns } from '../interfaces/numbers.interface';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { IIdentity } from '../../common/interfaces/identity.interface';
import { ModuleTypes } from '../../common/enums/module.enum';
import { IPluralKeys } from '../../common/interfaces/pluralkeys.interface';
import { IGenerate } from '../../common/interfaces/generate.interace';
import ProgressBar from 'progress';

const log: IDebugger = debug('app:numbersystems-generator');

const locales: string[] = availableLocales.availableLocales.modern;

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: locales.length * 2})

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const NODE_MODULES = '../../../../node_modules';

enum FormatTypes {
  DECIMAL = 'decimalFormats',
  CURRENCY = 'currencyFormats'
}

export default class NumberSystemGenerator implements IGenerate {
  constructor(){
    log('Created instance of NumberSystemsGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'numbers';

    log('Seeding currency modules...');
    if (NumberSystem.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await NumberSystem.db.dropCollection(collection).catch(e => log(e.message));
    }

    const ids = await Promise.all(locales.map(async locale => {
      return await this.generateLocaleData(locale)
        .then(data => {
          bar.tick({
            module: collection,
            locale: locale,
            mode: 'generated'
          });
          return data;
        }).then(data => {
          return this.insert(data);
        }).then(id => {
          bar.tick({
            module: collection,
            locale: locale,
            mode: 'inserted'
          });
          return id;
        });
    }));

    const inserted = ids.reduce((acc, val) => acc.concat(val), []).length;
    return `${inserted} documents inserted.`;
  }
  private async insert(localeData: INumberSystem[]) {
    return NumberSystem.insertMany(localeData);
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

  private getIdentity(numbersData, locale): IIdentity {
    const identityData = numbersData.main[locale].identity;

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

  private getMinimumGroupingDigits(numbers, locale): number {
    const stringRep: string = numbers.main[locale].numbers.minimumGroupingDigits;
    let output = parseInt(stringRep, 10) || 1;
    if (isNaN(output)) {
      output = 1
    }
    return output;
  }

  private getDisplayName(localeNames, system, locale): string {
    return localeNames.main[locale].localeDisplayNames.types.numbers[system];
  }

  private getNumberSymbols(numbers, system, locale) {
    return numbers.main[locale].numbers[`symbols-numberSystem-${system}`];
  }

  private getDigits(numberingSystems, system) {
    return numberingSystems.supplemental.numberingSystems[system]._digits;
  }

  private isDefault(numbers, system, locale) {
    return numbers.main[locale].numbers.defaultNumberingSystem === system ? true : false;
  }

  private isNative(numbers, system, locale) {
    return numbers.main[locale].numbers.otherNumberingSystems.native === system ? true : false;
  }

  private getDecimalPatterns(numbers, system, locale): IDecimalPatterns {
    return {
      standard: numbers.main[locale].numbers[`decimalFormats-numberSystem-${system}`].standard,
      short: this.getCompactDecimalPatterns(numbers, system, locale, 'short'),
      long: this.getCompactDecimalPatterns(numbers, system, locale, 'long')
    }
  }

  private getCompactDecimalPatterns(numbers, system, locale, type = 'short'): INumberPatterns | undefined {
    const dataBlock = numbers.main[locale].numbers[`${FormatTypes.DECIMAL}-numberSystem-${system}`][type].decimalFormat;
    if (!dataBlock) {
      return undefined;
    }
    return {
      '1000': this.getPlurals(1000, dataBlock),
      '10000': this.getPlurals(10000, dataBlock),
      '100000': this.getPlurals(100000, dataBlock),
      '1000000': this.getPlurals(1000000, dataBlock),
      '10000000': this.getPlurals(10000000, dataBlock),
      '100000000': this.getPlurals(100000000, dataBlock),
      '1000000000': this.getPlurals(1000000000, dataBlock),
      '10000000000': this.getPlurals(10000000000, dataBlock),
      '100000000000': this.getPlurals(100000000000, dataBlock),
      '1000000000000': this.getPlurals(1000000000000, dataBlock),
      '10000000000000': this.getPlurals(10000000000000, dataBlock),
      '100000000000000': this.getPlurals(100000000000000, dataBlock)
    };
  }

  private getCompactCurrencyPatterns(numbers, system, locale): INumberPatterns | undefined {
    const dataBlock = numbers.main[locale].numbers[`${FormatTypes.CURRENCY}-numberSystem-${system}`].short?.standard;
    if (!dataBlock) {
      return undefined;
    }
    return {
      '1000': this.getPlurals(1000, dataBlock),
      '10000': this.getPlurals(10000, dataBlock),
      '100000': this.getPlurals(100000, dataBlock),
      '1000000': this.getPlurals(1000000, dataBlock),
      '10000000': this.getPlurals(10000000, dataBlock),
      '100000000': this.getPlurals(100000000, dataBlock),
      '1000000000': this.getPlurals(1000000000, dataBlock),
      '10000000000': this.getPlurals(10000000000, dataBlock),
      '100000000000': this.getPlurals(100000000000, dataBlock),
      '1000000000000': this.getPlurals(1000000000000, dataBlock),
      '10000000000000': this.getPlurals(10000000000000, dataBlock),
      '100000000000000': this.getPlurals(100000000000000, dataBlock)
    };
  }

  private getPlurals(key: number, dataBlock): IPluralKeys {
    return {
      zero: dataBlock[`${key}-count-zero`],
      one: dataBlock[`${key}-count-one`],
      two: dataBlock[`${key}-count-two`],
      few: dataBlock[`${key}-count-few`],
      many: dataBlock[`${key}-count-many`],
      other: dataBlock[`${key}-count-other`],
    };
  }

  private getAccountingPattern(numbers, system, locale) {
    return numbers.main[locale].numbers[`currencyFormats-numberSystem-${system}`].accounting;
  }

  private getUnitPatterns(numbers, system, locale): IPluralKeys {
    const patterns = numbers.main[locale].numbers[`currencyFormats-numberSystem-${system}`];
    return {
      zero: patterns[`unitPattern-count-zero`],
      one: patterns[`unitPattern-count-one`],
      two: patterns[`unitPattern-count-two`],
      few: patterns[`unitPattern-count-few`],
      many: patterns[`unitPattern-count-many`],
      other: patterns[`unitPattern-count-other`],
    };
  }

  private getCurrencySpacingPatterns(numbers, system, locale) {
    return numbers.main[locale].numbers[`currencyFormats-numberSystem-${system}`].currencySpacing;
  }

  private getStandardCurrencyPattern(numbers, system, locale) {
    return numbers.main[locale].numbers[`currencyFormats-numberSystem-${system}`].standard;
  }

  private getCurrencyPatterns(numbers, system, locale): ICurrencyPatterns {
    return {
      standard: numbers.main[locale].numbers[`currencyFormats-numberSystem-${system}`].standard,
      short: this.getCompactCurrencyPatterns(numbers, system, locale),
      accounting: this.getAccountingPattern(numbers, system, locale),
      unit: this.getUnitPatterns(numbers, system, locale),
      spacing: this.getCurrencySpacingPatterns(numbers, system, locale)
    }
  }

  private getMiscellaneousPatterns(numbers, system, locale): IMiscPatterns {
    return numbers.main[locale].numbers[`miscPatterns-numberSystem-${system}`];
  }

  private getMinimalPairs(numbers, system, locale): IMinimalPairs {
    return numbers.main[locale].numbers.minimalPairs;
  }

  private getPercentPattern(numbers, system, locale): string {
    return numbers.main[locale].numbers[`percentFormats-numberSystem-${system}`].standard;
  }

  private getScientificPattern(numbers, system, locale): string {
    return numbers.main[locale].numbers[`scientificFormats-numberSystem-${system}`].standard;
  }

  private getPatterns(numbers, system, locale): INumberSystemPatterns {
    return {
      decimal: this.getDecimalPatterns(numbers, system, locale),
      currency: this.getCurrencyPatterns(numbers, system, locale),
      miscellaneous: this.getMiscellaneousPatterns(numbers, system, locale),
      minimalPairs: this.getMinimalPairs(numbers, system, locale),
      percent: this.getPercentPattern(numbers, system, locale),
      scientific: this.getScientificPattern(numbers, system, locale),
    }
  }

  private getMain(numbers, numberingSystems, localeNames, system, locale): INSData {
    return {
      name: system,
      minimumGroupingDigits: this.getMinimumGroupingDigits(numbers, locale),
      displayName: this.getDisplayName(localeNames, system, locale),
      symbols: this.getNumberSymbols(numbers, system, locale),
      digits: this.getDigits(numberingSystems, system),
      patterns: this.getPatterns(numbers, system, locale),
      isDefault: this.isDefault(numbers, system, locale),
      isNative: this.isNative(numbers, system, locale)
    }
  }

  private async generateLocaleData(locale: string): Promise<INumberSystem[]> {
    const numberingSystemsData = await this.getData(`${NODE_MODULES}/cldr-core/supplemental/numberingSystems.json`, locale);
    const numbersData = await this.getData(`${NODE_MODULES}/cldr-numbers-modern/main/{{locale}}/numbers.json`, locale);
    const localeNamesData = await this.getData(`${NODE_MODULES}/cldr-localenames-modern/main/{{locale}}/localeDisplayNames.json`, locale);

    const defaultNumberingSystem: string = numbersData.main[locale].numbers.defaultNumberingSystem;
    const nativeNumberingSystem: string = numbersData.main[locale].numbers.otherNumberingSystems?.native || defaultNumberingSystem;

    const systems = [defaultNumberingSystem, nativeNumberingSystem].filter(onlyUnique)

    const output: INumberSystem[] = systems.map(system => {
      return {
        tag: locale,
        identity: this.getIdentity(numbersData, locale),
        moduleType: ModuleTypes.NUMBERS,
        main: this.getMain(numbersData, numberingSystemsData, localeNamesData, system, locale)
      }
    });
    return output;
  }
}