import { model, Schema } from "mongoose";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { PluralKeysSchema } from "../../common/schemas/pluralKeys.schema";
import { IRelativeTime, IRelativeTimeData, IRelativeTimeFormats, IRelativeTimeFields } from "../interfaces/time.interface";

const RelativeTimeFieldsSchema = new Schema<IRelativeTimeFields>({
  displayName: String,
  altDisplayName: String,
  previous1: String,
  previous2: String,
  current: String,
  next1: String,
  next2: String,
  future: PluralKeysSchema,
  past: PluralKeysSchema
}, {_id: false});

const RelativeTimeFormatsSchema = new Schema<IRelativeTimeFormats>({
  standard: RelativeTimeFieldsSchema,
  short: RelativeTimeFieldsSchema,
  narrow: RelativeTimeFieldsSchema,
}, {_id: false});

const RelativeTimeDataSchema = new Schema<IRelativeTimeData>({
  era: RelativeTimeFormatsSchema,
  year: RelativeTimeFormatsSchema,
  quarter: RelativeTimeFormatsSchema,
  month: RelativeTimeFormatsSchema,
  week: RelativeTimeFormatsSchema,
  weekOfMonth: RelativeTimeFormatsSchema,
  day: RelativeTimeFormatsSchema,
  dayOfYear: RelativeTimeFormatsSchema,
  weekday: RelativeTimeFormatsSchema,
  weekdayOfMonth: RelativeTimeFormatsSchema,
  sun: RelativeTimeFormatsSchema,
  mon: RelativeTimeFormatsSchema,
  tue: RelativeTimeFormatsSchema,
  wed: RelativeTimeFormatsSchema,
  thu: RelativeTimeFormatsSchema,
  fri: RelativeTimeFormatsSchema,
  sat: RelativeTimeFormatsSchema,
  dayPeriod: RelativeTimeFormatsSchema,
  hour: RelativeTimeFormatsSchema,
  minute: RelativeTimeFormatsSchema,
  second: RelativeTimeFormatsSchema,
  zone: RelativeTimeFormatsSchema
}, {_id: false});

const RelativeTimeSchema = new Schema<IRelativeTime>({
  tag: {type: String, required: true},
  moduleType: {
    type: String,
    required: true
  },
  identity: {type: IdentitySchema, required: true},
  main: RelativeTimeDataSchema
});

export default model<IRelativeTime>("RelativeTime", RelativeTimeSchema)
