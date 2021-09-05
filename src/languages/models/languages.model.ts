import mongooseService from "../../common/services/mongoose.service";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { ILanguage, ILanguageData, ILanguageScript, ILanguageTerritory, IPluralRules, IPluralRanges } from "../interfaces/languages.interface";
import { PluralKeysSchema } from "../../common/schemas/pluralKeys.schema";

const {Schema, model } = mongooseService.getMongoose();

const LanguageScriptSchema = new Schema<ILanguageScript>({
  tag: String,
  scriptStatus: String
}, {_id: false});

const LanguageTerritorySchema = new Schema<ILanguageTerritory>({
  tag: String,
  languageStatus: String
}, {_id: false});

const PluralRulesSchema = new Schema<IPluralRules>({
  cardinal: PluralKeysSchema,
  ordinal: PluralKeysSchema
}, {_id: false});

const PluralRangesSchema = new Schema<IPluralRanges>({
  'start-zero-end-zero': String,
  'start-zero-end-one': String,
  'start-zero-end-two': String,
  'start-zero-end-few': String,
  'start-zero-end-many': String,
  'start-zero-end-other': String,
  'start-one-end-zero': String,
  'start-one-end-one': String,
  'start-one-end-two': String,
  'start-one-end-few': String,
  'start-one-end-many': String,
  'start-one-end-other': String,
  'start-two-end-zero': String,
  'start-two-end-one': String,
  'start-two-end-two': String,
  'start-two-end-few': String,
  'start-two-end-many': String,
  'start-two-end-other': String,
  'start-few-end-zero': String,
  'start-few-end-one': String,
  'start-few-end-two': String,
  'start-few-end-few': String,
  'start-few-end-many': String,
  'start-few-end-other': String,
  'start-many-end-zero': String,
  'start-many-end-one': String,
  'start-many-end-two': String,
  'start-many-end-few': String,
  'start-many-end-many': String,
  'start-many-end-other': String,
  'start-other-end-zero': String,
  'start-other-end-one': String,
  'start-other-end-two': String,
  'start-other-end-few': String,
  'start-other-end-many': String,
  'start-other-end-other': String
}, {_id: false})

export const LanguageDataSchema = new Schema<ILanguageData>({
  tag: {type: String, required: true},
  displayName: String,
  languageFamily: String,
  pluralRules: PluralRulesSchema,
  pluralRanges: PluralRangesSchema,
  scripts: [LanguageScriptSchema],
  territories: [LanguageTerritorySchema]
}, {_id: false});

const LanguageSchema = new Schema<ILanguage>({
  tag: {type: String, required: true},
  identity: IdentitySchema,
  moduleType: {
    type: String,
    required: true
  },
  main: LanguageDataSchema
});

export default model<ILanguage>("Language", LanguageSchema)
