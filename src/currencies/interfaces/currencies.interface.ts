import { ModuleTypes } from "../../common/enums/module.enum";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { IModule } from "../../common/interfaces/module.interface";
import { IPluralKeys } from "../../common/interfaces/pluralkeys.interface";

export interface ICurrencySymbols {
  standard: string
  narrow: string
}

export interface ICurrencyFractions {
  rounding: number
  digits: number
  cashRounding?: number
  cashDigits?: number
}

export interface ICurrencyTerritory {
  territory: string
  from: string 
  to?: string 
  isTender?: boolean
}

export interface ICurrencyData {
    code: string
    displayName: string
    plurals: IPluralKeys
    symbols: ICurrencySymbols
    fractions: ICurrencyFractions
    isCurrent: boolean
    territories?: ICurrencyTerritory[]
}

export interface ICurrency extends IModule<ICurrencyData> {
  tag: string
  moduleType: ModuleTypes.CURRENCIES
  identity: IIdentity
  main: ICurrencyData
}
