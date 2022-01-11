import { Types } from "mongoose";
import { ModuleTypes } from "../../common/enums/module.enum";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { IModule } from "../../common/interfaces/module.interface";
import { IPluralKeys } from "../../common/interfaces/pluralkeys.interface";

export interface INumberPatterns {
  '1000': IPluralKeys
  '10000': IPluralKeys
  '100000': IPluralKeys
  '1000000': IPluralKeys
  '10000000': IPluralKeys
  '100000000': IPluralKeys
  '1000000000': IPluralKeys
  '10000000000': IPluralKeys
  '100000000000': IPluralKeys
  '1000000000000': IPluralKeys
  '10000000000000': IPluralKeys
  '100000000000000': IPluralKeys
}

export interface IDecimalPatterns {
  standard: string
  short?: INumberPatterns
  long?: INumberPatterns
}

export interface ISpacing {
  currencyMatch: string
  surroundingMatch: string
  insertBetween: string
}

export interface ICurrencySpacing {
  beforeCurrency: ISpacing
  afterCurrency: ISpacing
}

export interface ICurrencyPatterns {
  standard: string
  short?: INumberPatterns
  unit?: IPluralKeys
  accounting?: string
  spacing: ICurrencySpacing
}

export interface IMiscPatterns {
  approximately: string
  atLeast: string
  atMost: string
  range: string
}

export interface IMinimalPairs {
  [key: string]: string
}

export interface INumberSystemPatterns {
  decimal: IDecimalPatterns
  currency: ICurrencyPatterns
  miscellaneous: IMiscPatterns
  minimalPairs: IMinimalPairs
  percent: string
  scientific: string

}

export interface INumberSystemSymbols {
  approximatelySign: string
  decimal: string
  group: string
  list: string
  percentSign: string
  plusSign: string
  minusSign: string
  exponential: string
  superscriptingExponent: string
  perMille: string
  infinity: string
  currencyGroup?: string
  currencyDecimal?: string
  nan: string
  timeSeparator: string
}

export interface INSData {
  name: string
  displayName: string
  minimumGroupingDigits: number
  digits: string,
  symbols: INumberSystemSymbols
  patterns: INumberSystemPatterns
  isDefault: boolean
  isNative: boolean
}

export interface INumberSystem extends IModule<INSData> {
  _id?: Types.ObjectId
  tag: string
  identity: IIdentity
  moduleType: ModuleTypes.NUMBERS
  main: INSData
}
