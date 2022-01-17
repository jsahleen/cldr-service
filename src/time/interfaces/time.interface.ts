import { IPluralKeys } from "../../common/interfaces/pluralkeys.interface";
import { IModule } from "../../common/interfaces/module.interface";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { Types } from "mongoose";
import { ModuleTypes } from "../../common/enums/module.enum";

export interface IRelativeTimeFields {
  displayName?: string
  altDisplayName?: string
  previous1?: string
  previous2?: string
  current?: string
  next1?: string
  next2?: string
  future?: IPluralKeys
  past?: IPluralKeys
}

export interface IRelativeTimeFormats {
  standard: IRelativeTimeFields
  short: IRelativeTimeFields
  narrow: IRelativeTimeFields
}

export interface IRelativeTimeData {
  era: IRelativeTimeFormats
  year: IRelativeTimeFormats
  quarter: IRelativeTimeFormats
  month: IRelativeTimeFormats
  week: IRelativeTimeFormats
  weekOfMonth: IRelativeTimeFormats
  day: IRelativeTimeFormats
  dayOfYear: IRelativeTimeFormats
  weekday: IRelativeTimeFormats
  weekdayOfMonth: IRelativeTimeFormats
  sun: IRelativeTimeFormats
  mon: IRelativeTimeFormats
  tue: IRelativeTimeFormats
  wed: IRelativeTimeFormats
  thu: IRelativeTimeFormats
  fri: IRelativeTimeFormats
  sat: IRelativeTimeFormats
  dayPeriod: IRelativeTimeFormats
  hour: IRelativeTimeFormats
  minute: IRelativeTimeFormats
  second: IRelativeTimeFormats
  zone: IRelativeTimeFormats
}

export interface IRelativeTime extends IModule<IRelativeTimeData> {
  _id?: Types.ObjectId
  tag: string
  moduleType: ModuleTypes.TIME
  identity: IIdentity
  main: IRelativeTimeData
}