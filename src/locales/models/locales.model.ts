import mongooseService from "../../common/services/mongoose.service";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { ILocale, ILocaleData, ILocalePatterns, ILocaleCodePatterns, ILocaleDisplayPattern } from "../interfaces/locales.interface";

const {Schema, model } = mongooseService.getMongoose();

const LocaleDisplayPatternSchema = new Schema<ILocaleDisplayPattern>({
  standard: String,
  separator: String,
  keyType: String
}, {_id: false});

const LocaleCodePatternsSchema = new Schema<ILocaleCodePatterns>({
  language: String,
  script: String,
  territory: String
}, {_id: false});

const LocalePatternsSchema = new Schema<ILocalePatterns>({
  display: LocaleDisplayPatternSchema,
  code: LocaleCodePatternsSchema
}, {_id: false})

const LocaleDataSchema = new Schema<ILocaleData>({
  tag: {type: String, required: true},
  parentLocale: String,
  likelySubtags: String,
  patterns: LocalePatternsSchema,
  language: {
    type: 'ObjectId',
    ref: 'Language',
    required: true
  },
  script: {
    type: 'ObjectId',
    ref: 'Script'
  },
  territory: {
    type: 'ObjectId',
    ref: 'Territory'
  },
  variant: {
    type: 'ObjectId',
    ref: 'Variant'
  }
}, {_id: false});

const LocaleSchema = new Schema<ILocale>({
  tag: {type: String, required: true},
  identity: IdentitySchema,
  moduleType: {
    type: String,
    required: true
  },
  main: LocaleDataSchema
});

export default model<ILocale>("Locale", LocaleSchema)
