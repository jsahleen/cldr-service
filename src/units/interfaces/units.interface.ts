import { Types } from "mongoose";
import { ModuleTypes } from "../../common/enums/module.enum";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { IModule } from "../../common/interfaces/module.interface";
import { IPluralKeys } from "../../common/interfaces/pluralkeys.interface";

export interface IUnitSubtags {
  category: string
  unit: string
}

export interface IStyles {
  long: string
  short: string
  narrow: string
}

export interface IUnitDisplayNames extends IStyles {}
export interface IUnitPer extends IStyles {}
export interface IUnitTimes extends IStyles {}

export interface IUnitPower2 {
  long: IPluralKeys,
  short: IPluralKeys,
  narrow: IPluralKeys
}

export interface IUnitPower3 extends IUnitPower2 {}

export interface IUnitPrefixPatterns {
  "10p-1": string
  "10p-2": string
  "10p-3": string
  "10p-6": string
  "10p-9": string
  "10p-12": string
  "10p-15": string
  "10p-18": string
  "10p-21": string
  "10p-24": string
  "10p1": string
  "10p2": string
  "10p3": string
  "10p6": string
  "10p9": string
  "10p12": string
  "10p15": string
  "10p18": string
  "10p21": string
  "10p24": string
  "1024": string
  "1024p1": string
  "1024p2": string
  "1024p3": string
  "1024p4": string
  "1024p5": string
  "1024p6": string
  "1024p7": string
  "1024p8": string
}

export interface IUnitPrefixPatternSets {
  long: IUnitPrefixPatterns
  short: IUnitPrefixPatterns
  narrow: IUnitPrefixPatterns
}

export interface IUnitCoordinatePatterns {
  displayName: string
  north: string
  south: string
  east: string
  west: string
}

export interface IUnitCoordinatePatternSets {
  long: IUnitCoordinatePatterns
  short: IUnitCoordinatePatterns
  narrow: IUnitCoordinatePatterns
}

export interface IUnitPluralPatternSets {
  long: IPluralKeys
  short: IPluralKeys
  narrow: IPluralKeys
}

export interface IUnitPatterns {
  prefixes: IUnitPrefixPatternSets
  per: IUnitPer
  times: IUnitTimes
  power2: IUnitPower2
  power3: IUnitPower3
  coordinates: IUnitCoordinatePatternSets
  plurals: IUnitPluralPatternSets
}

export interface IUnitData {
  tag: string
  subtags: IUnitSubtags | void,
  gender?: string
  displayNames: IUnitDisplayNames
  patterns: IUnitPatterns
}

export interface IUnit extends IModule<IUnitData> {
  _id?: Types.ObjectId
  tag: string
  moduleType: ModuleTypes.UNITS
  identity: IIdentity
  main: IUnitData
}
