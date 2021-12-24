import mongooseService from "../../common/services/mongoose.service";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { IAppendItems, IBranches, ICalendar, ICalendarData, ICalendarFormats, ISexagenaryCycle,
  ICalendarNames, ICalendarSkeletons, ICyclical, ICyclicalDayParts, ICyclicalSolarTerms, 
  ICyclicalSolarTermsNames, ICyclicalZodiac, IDayNames, IDayPeriodNames, IDayPeriods, IDays, 
  IEntries, IEraNames, IEraEntry, IFormats, IIntervals, IMonthNames, IMonths, IQuarterNames, 
  IQuarters, ISkeletons, ICyclicalYears, ICyclicalMonths, ICyclicalDays, ICalendarPatterns, ICalendarPatternsEntry } from "../interfaces/calendars.interface";

const {Schema, model } = mongooseService.getMongoose();

export const DayPeriodNamesSchema = new Schema<IDayPeriodNames>({
  midnight: String,
  noon: String,
  am: String,
  amAlt: String,
  pm: String,
  pmAlt: String,
  morning1: String,
  morning2: String,
  afternoon1: String,
  afternoon2: String,
  evening1: String,
  evening2: String,
  night1: String,
  night2: String
}, {_id: false});

export const DayPeriodEntriesSchema = new Schema<IEntries<IDayPeriodNames>>({
  abbreviated: DayPeriodNamesSchema,
  narrow: DayPeriodNamesSchema,
  wide: DayPeriodNamesSchema
}, {_id: false});

export const DayPeriodsSchema = new Schema<IDayPeriods>({
  format: DayPeriodEntriesSchema,
  standAlone: DayPeriodEntriesSchema
}, {_id: false})


export const DayNamesSchema = new Schema<IDayNames>({
  sun: String,
  mon: String,
  tue: String,
  wed: String,
  thu: String,
  fri: String,
  sat: String
}, {_id: false})

export const DayEntriesSchema = new Schema<IEntries<IDayNames>>({
  abbreviated: DayNamesSchema,
  narrow: DayNamesSchema,
  wide: DayNamesSchema
}, {_id: false})

export const DaysSchema = new Schema<IDays>({
  format: DayEntriesSchema,
  standAlone: DayEntriesSchema
}, {_id: false});

export const MonthNamesSchema = new Schema<IMonthNames>({
  "1": String,
  "2": String,
  "3": String,
  "4": String,
  "5": String,
  "6": String,
  "7": String,
  "7-yeartype-leap": String,
  "8": String,
  "9": String,
  "10": String,
  "11": String,
  "12": String
}, {_id: false});

export const MonthEntriesSchema = new Schema<IEntries<IMonthNames>>({
  abbreviated: MonthNamesSchema,
  narrow: MonthNamesSchema,
  wide: MonthNamesSchema
}, {_id: false});

export const MonthsSchema = new Schema<IMonths>({
  format: MonthEntriesSchema,
  standAlone: MonthEntriesSchema
}, {_id: false});

export const QuarterNamesSchema = new Schema<IQuarterNames>({
  "1": String,
  "2": String,
  "3": String,
  "4": String
}, {_id: false});

export const QuarterEntriesSchema = new Schema<IEntries<IQuarterNames>>({
  abbreviated: QuarterNamesSchema,
  narrow: QuarterNamesSchema,
  wide: QuarterNamesSchema
}, {_id: false});

export const QuartersSchema = new Schema<IQuarters>({
  format: QuarterEntriesSchema,
  standAlone: QuarterEntriesSchema
}, {_id: false});

export const EraEntriesSchema = new Schema<IEntries<IEraNames>>({
  abbreviated: String,
  narrow: String,
  wide: String
}, {_id: false});

export const ErasEntrySchema = new Schema<IEraEntry>({
  names: {
    standard: EraEntriesSchema,
    alt: EraEntriesSchema
  },
  start: String,
  end: String
}, {_id: false});

export const SexegenaryCycleSchema = new Schema<ISexagenaryCycle>({
  "1": String,
  "2": String,
  "3": String,
  "4": String,
  "5": String,
  "6": String,
  "7": String,
  "8": String,
  "9": String,
  "10": String,
  "11": String,
  "12": String,
  "13": String,
  "14": String,
  "15": String,
  "16": String,
  "17": String,
  "18": String,
  "19": String,
  "20": String,
  "21": String,
  "22": String,
  "23": String,
  "24": String,
  "25": String,
  "26": String,
  "27": String,
  "28": String,
  "29": String,
  "30": String,
  "31": String,
  "32": String,
  "33": String,
  "34": String,
  "35": String,
  "36": String,
  "37": String,
  "38": String,
  "39": String,
  "40": String,
  "41": String,
  "42": String,
  "43": String,
  "44": String,
  "45": String,
  "46": String,
  "47": String,
  "48": String,
  "49": String,
  "50": String,
  "51": String,
  "52": String,
  "53": String,
  "54": String,
  "55": String,
  "56": String,
  "57": String,
  "58": String,
  "59": String,
  "60": String
}, {_id: false});

export const BranchesSchema = new Schema<IBranches>({
  "1": String,
  "2": String,
  "3": String,
  "4": String,
  "5": String,
  "6": String,
  "7": String,
  "8": String,
  "9": String,
  "10": String,
  "11": String,
  "12": String
}, {_id: false});

export const CyclicalSolarTermsNamesSchema = new Schema<ICyclicalSolarTermsNames>({
  "1": String,
  "2": String,
  "3": String,
  "4": String,
  "5": String,
  "6": String,
  "7": String,
  "8": String,
  "9": String,
  "10": String,
  "11": String,
  "12": String,
  "13": String,
  "14": String,
  "15": String,
  "16": String,
  "17": String,
  "18": String,
  "19": String,
  "20": String,
  "21": String,
  "22": String,
  "23": String,
  "24": String
}, {_id: false});

export const CyclicalDayPartEntriesSchema = new Schema<IEntries<IBranches>>({
  narrow: BranchesSchema,
  abbreviated: BranchesSchema,
  wide: BranchesSchema
}, {_id: false});

export const CyclicalDayPartsSchema = new Schema<ICyclicalDayParts>({
  format: CyclicalDayPartEntriesSchema
}, {_id: false});

export const CyclicalSolarTermsEntriesSchema = new Schema<IEntries<ICyclicalSolarTermsNames>>({
  narrow: CyclicalSolarTermsNamesSchema,
  abbreviated: CyclicalSolarTermsNamesSchema,
  wide: CyclicalSolarTermsNamesSchema
}, {_id: false});

export const CyclicalSolarTermsSchema = new Schema<ICyclicalSolarTerms>({
  format: CyclicalSolarTermsEntriesSchema
}, {_id: false});

export const CyclicalZodiacEntriesSchema = new Schema<IEntries<IBranches>>({
  narrow: BranchesSchema,
  abbreviated: BranchesSchema,
  wide: BranchesSchema
}, {_id: false});

export const CyclicalZodiacSchema = new Schema<ICyclicalZodiac>({
  format: CyclicalZodiacEntriesSchema
}, {_id: false});

export const CyclicalDaysEntriesSchema = new Schema<IEntries<ISexagenaryCycle>>({
  narrow: SexegenaryCycleSchema,
  abbreviated: SexegenaryCycleSchema,
  wide: SexegenaryCycleSchema
}, {_id: false});

export const CyclicalDaysSchema = new Schema<ICyclicalDays>({
  format: CyclicalDaysEntriesSchema
}, {_id: false});

export const CyclicalMonthsEntriesSchema = new Schema<IEntries<ISexagenaryCycle>>({
  narrow: SexegenaryCycleSchema,
  abbreviated: SexegenaryCycleSchema,
  wide: SexegenaryCycleSchema
}, {_id: false});

export const CyclicalMonthsSchema = new Schema<ICyclicalMonths>({
  format: CyclicalMonthsEntriesSchema
}, {_id: false});

export const CyclicalYearsEntriesSchema = new Schema<IEntries<ISexagenaryCycle>>({
  narrow: SexegenaryCycleSchema,
  abbreviated: SexegenaryCycleSchema,
  wide: SexegenaryCycleSchema
}, {_id: false});

export const CyclicalYearsSchema = new Schema<ICyclicalYears>({
  format: CyclicalYearsEntriesSchema
}, {_id: false});

export const CyclicalSchema = new Schema<ICyclical>({
  dayParts: CyclicalDayPartsSchema,
  days: CyclicalDaysSchema,
  months: CyclicalMonthsSchema,
  years: CyclicalYearsSchema,
  solarTerms: CyclicalSolarTermsSchema,
  zodiacs: CyclicalZodiacSchema
}, {_id: false});

export const CalendarNamesSchema = new Schema<ICalendarNames>({
  dayPeriods: DayPeriodsSchema,
  days: DaysSchema,
  months: MonthsSchema,
  quarters: QuartersSchema,
  eras: {type: Map, of: ErasEntrySchema},
  cyclical: CyclicalSchema
}, {_id: false});

export const FormatsSchema = new Schema<IFormats>({
  full: String,
  long: String,
  medium: String,
  short: String,
}, {_id: false});

export const AppendItemFormatsSchema = new Schema<IAppendItems>({
  Day: String,
  DayOfWeek: String,
  Era: String,
  Hour: String,
  Minute: String,
  Month: String,
  Quarter: String,
  Second: String,
  Timezone: String,
  Week: String,
  Year: String
}, {_id: false});

export const IntervalFormatsSchema = new Schema<IIntervals>({
  fallback: String,
  formats: {
    type: Map,
    of: {
      type: Map,
      of: String
    }
  }
}, {_id: false});

export const CalendarFormatsSchema = new Schema<ICalendarFormats>({
  date: FormatsSchema,
  time: FormatsSchema,
  join: FormatsSchema,
  available: {type: Map, of: String},
  appendItems: AppendItemFormatsSchema,
  intervals: IntervalFormatsSchema
}, {_id: false});

export const CalendarPatternsEntrySchema = new Schema<ICalendarPatternsEntry>({
  leap: String
}, {_id: false});

export const CalendarPatternsEntriesSchema = new Schema<IEntries<ICalendarPatternsEntry>>({
  wide: CalendarPatternsEntrySchema,
  abbreviated: CalendarPatternsEntrySchema,
  narrow: CalendarPatternsEntrySchema
}, {_id: false})

export const CalendarPatternsSchema = new Schema<ICalendarPatterns>({
  format: CalendarPatternsEntriesSchema,
  standAlone: CalendarPatternsEntriesSchema,
  all: String
}, {_id: false})

export const SkeletonsSchema = new Schema<ISkeletons>({
  full: String,
  long: String,
  medium: String,
  short: String
}, {_id: false});

export const CalendarSkeletonsSchema = new Schema<ICalendarSkeletons>({
  date: SkeletonsSchema,
  time: SkeletonsSchema,
}, {_id: false});

export const CalendarDataSchema = new Schema<ICalendarData>({
  tag: String,
  displayName: String,
  dateNumberSystem: String,
  names: CalendarNamesSchema,
  formats: CalendarFormatsSchema,
  patterns: CalendarPatternsSchema,
  skeletons: CalendarSkeletonsSchema,
  isPreferred: Boolean,
  calendarSystem: String
}, {_id: false});

const CalendarSchema = new Schema<ICalendar>({
  tag: String,
  identity: IdentitySchema,
  moduleType: {
    type: String,
    required: true
  },
  main: CalendarDataSchema
});

export default model<ICalendar>("Calendar", CalendarSchema)
