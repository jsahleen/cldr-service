import { ModuleTypes } from "../../common/enums/module.enum";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { IModule } from "../../common/interfaces/module.interface";

export interface IDayPeriodNames {
  midnight?: string
  noon?: string
  am: string
  amAlt?: string
  pm: string,
  pmAlt?: string
  morning1?: string,
  morning2?: string,
  afternoon1?: string,
  afternoon2?: string,
  evening1?: string,
  evening2?: string,
  night1?: string
  night2?: string
}

export interface IDayNames {
  sun: string
  mon: string
  tue: string
  wed: string
  thu: string
  fri: string
  sat: string
}

export interface IMonthNames {
  "1": string
  "2": string
  "3": string
  "4": string
  "5": string
  "6": string
  "7": string
  "7-yeartype-leap": string
  "8": string
  "9": string
  "10": string
  "11": string
  "12": string
  "13"?: string
}

export interface IQuarterNames {
  "1": string
  "2": string
  "3": string
  "4": string
}

export interface IEntries<T> {
  abbreviated: T
  narrow: T
  wide: T
}

export interface ICategories<T> {
  format: IEntries<T>
}

export interface IDays extends ICategories<IDayNames> {
  format: IEntries<IDayNames>
  standAlone: IEntries<IDayNames>
}

export interface IMonths extends ICategories<IMonthNames> {
  format: IEntries<IMonthNames>
  standAlone: IEntries<IMonthNames>
}

export interface IQuarters extends ICategories<IQuarterNames> {
  format: IEntries<IQuarterNames>
  standAlone: IEntries<IQuarterNames>
}

export interface IDayPeriods extends ICategories<IDayPeriodNames> {
  format: IEntries<IDayPeriodNames>
  standAlone: IEntries<IDayPeriodNames>
}

export interface IEraNames {
  wide: string
  abbreviated: string
  narrow: string
}

export interface IEraEntry {
  names: {
    standard: IEraNames,
    alt?: IEraNames
  }
  start?: string,
  end?: string
}

export interface IEras {
  [key: string]: IEraEntry
}

export interface ISexagenaryCycle {
  "1": string
  "2": string
  "3": string
  "4": string
  "5": string
  "6": string
  "7": string
  "8": string
  "9": string
  "10": string
  "11": string
  "12": string
  "13": string
  "14": string
  "15": string
  "16": string
  "17": string
  "18": string
  "19": string
  "20": string
  "21": string
  "22": string
  "23": string
  "24": string
  "25": string
  "26": string
  "27": string
  "28": string
  "29": string
  "30": string
  "31": string
  "32": string
  "33": string
  "34": string
  "35": string
  "36": string
  "37": string
  "38": string
  "39": string
  "40": string
  "41": string
  "42": string
  "43": string
  "44": string
  "45": string
  "46": string
  "47": string
  "48": string
  "49": string
  "50": string
  "51": string
  "52": string
  "53": string
  "54": string
  "55": string
  "56": string
  "57": string
  "58": string
  "59": string
  "60": string
}

export interface ICyclicalSolarTermsNames {
  "1": string
  "2": string
  "3": string
  "4": string
  "5": string
  "6": string
  "7": string
  "8": string
  "9": string
  "10": string
  "11": string
  "12": string
  "13": string
  "14": string
  "15": string
  "16": string
  "17": string
  "18": string
  "19": string
  "20": string
  "21": string
  "22": string
  "23": string
  "24": string
}

export interface IBranches {
  "1": string
  "2": string
  "3": string
  "4": string
  "5": string
  "6": string
  "7": string
  "8": string
  "9": string
  "10": string
  "11": string
  "12": string
}

export interface ICyclicalSolarTermsNames {
  "1": string
  "2": string
  "3": string
  "4": string
  "5": string
  "6": string
  "7": string
  "8": string
  "9": string
  "10": string
  "11": string
  "12": string
  "13": string
  "14": string
  "15": string
  "16": string
  "17": string
  "18": string
  "19": string
  "20": string
  "21": string
  "22": string
  "23": string
  "24": string
}

export interface ICyclicalDayParts extends ICategories<IBranches> {
  format: IEntries<IBranches>
}

export interface ICyclicalMonths extends ICategories<ISexagenaryCycle> {
  format: IEntries<ISexagenaryCycle>
}

export interface ICyclicalYears extends ICategories<ISexagenaryCycle> {
  format: IEntries<ISexagenaryCycle>
}

export interface ICyclicalDays extends ICategories<ISexagenaryCycle> {
  format: IEntries<ISexagenaryCycle>
}

export interface ICyclicalSolarTerms extends ICategories<ICyclicalSolarTermsNames> {
  format: IEntries<ICyclicalSolarTermsNames>
}

export interface ICyclicalZodiac extends ICategories<IBranches>{
  format: IEntries<IBranches>
}

export interface ICyclical {
  dayParts: ICyclicalDayParts
  years: ICyclicalYears
  months: ICyclicalMonths
  days: ICyclicalDays
  solarTerms: ICyclicalSolarTerms
  zodiacs: ICyclicalZodiac
}

export interface ICalendarNames {
  days: IDays
  months: IMonths
  quarters: IQuarters
  dayPeriods: IDayPeriods
  eras?: IEras
  cyclical?: ICyclical
}

export interface IFormats {
  full: string
  long: string
  medium: string
  short: string
  available?: {
    [key: string]: string
  }
}

export interface ISkeletons {
  full: string
  long: string
  medium: string
  short: string
}

export interface IAppendItems {
  Day: string,
  DayOfWeek: string,
  Era: string,
  Hour: string,
  Minute: string,
  Month: string,
  Quarter: string,
  Second: string,
  Timezone: string,
  Week: string,
  Year: string
}

export interface IAvailableFormats {
  [key: string]: string
}

export interface IIntervals {
  fallback: string
  formats: {
    [key: string]: string | {
      [key: string]: string
    }  
  }
}

export interface ICalendarFormats {
  date: IFormats
  time: IFormats
  join: IFormats
  available: IAvailableFormats
  appendItems: IAppendItems
  intervals: IIntervals
}

export interface ICalendarPatternsEntry {
  leap: string
}

export interface ICalendarPatterns {
  format: IEntries<ICalendarPatternsEntry>
  standAlone: IEntries<ICalendarPatternsEntry>
  all?: ICalendarPatternsEntry
}

export interface ICalendarSkeletons {
  date: ISkeletons
  time: ISkeletons
}

export interface ICalendarData {
  tag: string
  displayName: string
  dateNumberSystem: string
  names: ICalendarNames
  formats: ICalendarFormats
  patterns: ICalendarPatterns
  skeletons: ICalendarSkeletons
  isPreferred: boolean
  calendarSystem: string
}

export interface ICalendar extends IModule<ICalendarData> {
  tag: string
  moduleType: ModuleTypes.CALENDARS
  identity: IIdentity
  main: ICalendarData
}
