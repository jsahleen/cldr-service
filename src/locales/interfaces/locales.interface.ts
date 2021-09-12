import { ModuleTypes } from "../../common/enums/module.enum";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { IModule } from "../../common/interfaces/module.interface";
import { ILanguageData } from "../../languages/interfaces/languages.interface";
import { IScriptData } from "../../scripts/interfaces/scripts.interface";
import { ITerritoryData } from "../../territories/interfaces/territories.interface";
import { IVariantData } from "../../variants/interfaces/variants.interface";

export interface ILocaleDisplayPattern {
  standard: string
  separator: string
  keyType: string
}

export interface ILocaleCodePatterns {
  language: string,
  script: string,
  territory: string
}

export interface ILocalePatterns {
  display: ILocaleDisplayPattern
  code: ILocaleCodePatterns
}

export interface ILocaleData {
  tag: string
  parentLocale: string
  likelySubtags: string
  patterns: ILocalePatterns
  language: ILanguageData | undefined
  script?: IScriptData | undefined,
  territory?: ITerritoryData | undefined,
  variants?: IVariantData[] | undefined
}

export interface ILocale extends IModule<ILocaleData> {
  tag: string
  moduleType: ModuleTypes.LOCALES
  identity: IIdentity
  main: ILocaleData
}

