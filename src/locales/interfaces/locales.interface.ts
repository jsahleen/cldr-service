import { ModuleTypes } from "../../common/enums/module.enum";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { IModule } from "../../common/interfaces/module.interface";
import { ILanguage } from "../../languages/interfaces/languages.interface";
import { IScript } from "../../scripts/interfaces/scripts.interface";
import { ITerritory } from "../../territories/interfaces/territories.interface";
import { IVariant } from "../../variants/interfaces/variants.interface";
import { Document, PopulatedDoc } from "mongoose";

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
  language: PopulatedDoc<ILanguage & Document>
  script?: PopulatedDoc<IScript & Document>,
  territory?: PopulatedDoc<ITerritory & Document>,
  variant?: PopulatedDoc<IVariant & Document>
}

export interface ILocale extends IModule<ILocaleData> {
  tag: string
  moduleType: ModuleTypes.LOCALES
  identity: IIdentity
  main: ILocaleData
}

