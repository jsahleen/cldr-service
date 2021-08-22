import { ModuleTypes } from "../../common/enums/module.enum";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { IModule } from "../../common/interfaces/module.interface";
import { IPluralKeys } from "../../common/interfaces/pluralkeys.interface";

export interface ILanguageScript {
  tag: string
  scriptStatus: 'primary' | 'secondary'
}

export interface ILanguageTerritory {
  tag: string
  languageStatus: 'primary' | 'secondary'
}

export interface IPluralRanges {
  'start-zero-end-zero': string
  'start-zero-end-one': string
  'start-zero-end-two': string
  'start-zero-end-few': string
  'start-zero-end-many': string
  'start-zero-end-other': string
  'start-one-end-zero': string
  'start-one-end-one': string
  'start-one-end-two': string
  'start-one-end-few': string
  'start-one-end-many': string
  'start-one-end-other': string
  'start-two-end-zero': string
  'start-two-end-one': string
  'start-two-end-two': string
  'start-two-end-few': string
  'start-two-end-many': string
  'start-two-end-other': string
  'start-few-end-zero': string
  'start-few-end-one': string
  'start-few-end-two': string
  'start-few-end-few': string
  'start-few-end-many': string
  'start-few-end-other': string
  'start-many-end-zero': string
  'start-many-end-one': string
  'start-many-end-two': string
  'start-many-end-few': string
  'start-many-end-many': string
  'start-many-end-other': string
  'start-other-end-zero': string
  'start-other-end-one': string
  'start-other-end-two': string
  'start-other-end-few': string
  'start-other-end-many': string
  'start-other-end-other': string
}

export interface IPluralRules {
  cardinal: IPluralKeys
  ordinal: IPluralKeys
}

export interface ILanguageData {
  tag: string
  displayName: string
  languageFamily: string
  pluralRules: IPluralRules
  pluralRanges: IPluralRanges | Record<string, never>
  scripts: ILanguageScript[]
  territories: ILanguageTerritory[]
}

export interface ILanguage extends IModule<ILanguageData> {
  tag: string
  moduleType: ModuleTypes.LANGUAGES
  identity: IIdentity
  main: ILanguageData
}

