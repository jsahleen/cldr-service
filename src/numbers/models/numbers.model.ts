import mongooseService from "../../common/services/mongoose.service";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { ICurrencyPatterns, ICurrencySpacing, IDecimalPatterns, IMiscPatterns, INSData, INumberPatterns, INumberSystem, INumberSystemPatterns, INumberSystemSymbols, ISpacing, } from "../interfaces/numbers.interface";
import { PluralKeysSchema } from "../../common/schemas/pluralKeys.schema";

const {Schema, model } = mongooseService.getMongoose();

const NumberSystemSymbolsSchema = new Schema<INumberSystemSymbols>({
  approximatelySign: {type: String, required: true},
  decimal: {type: String, required: true},
  group: {type: String, required: true},
  list: {type: String, required: true},
  percentSign: {type: String, required: true},
  plusSign: {type: String, required: true},
  minusSign: {type: String, required: true},
  exponential: {type: String, required: true},
  superscriptingExponent: {type: String, required: true},
  perMille: {type: String, required: true},
  infinity: {type: String, required: true},
  currencyGroup: {type: String, required: false},
  currencyDecimal: {type: String, required: false},
  nan: {type: String, required: true},
  timeSeparator: {type: String, required: true}
}, {_id: false});

const NumberPatternsSchema = new Schema<INumberPatterns>({
  "1000": PluralKeysSchema,
  "10000": PluralKeysSchema,
  "100000": PluralKeysSchema,
  "1000000": PluralKeysSchema,
  "10000000": PluralKeysSchema,
  "100000000": PluralKeysSchema,
  "1000000000": PluralKeysSchema,
  "10000000000": PluralKeysSchema,
  "100000000000": PluralKeysSchema,
  "1000000000000": PluralKeysSchema,
  "10000000000000": PluralKeysSchema
}, {_id: false});

const DecimalPatternsSchema = new Schema<IDecimalPatterns>({
  standard: { type: String, required: true },
  short: NumberPatternsSchema,
  long: NumberPatternsSchema
}, {_id: false});

const SpacingSchema = new Schema<ISpacing>({
  currencyMatch: String,
  surroundingMatch: String,
  insertBetween: String
}, {_id: false});

const CurrencySpacingSchema = new Schema<ICurrencySpacing>({
  beforeCurrency: SpacingSchema,
  afterCurrency: SpacingSchema
}, {_id: false});

const CurrencyPatternsSchema = new Schema<ICurrencyPatterns>({
  standard: {type: String, required: true},
  short: NumberPatternsSchema,
  unit: PluralKeysSchema,
  accounting: String,
  spacing: CurrencySpacingSchema,
}, {_id: false});

const MiscPatternsSchema = new Schema<IMiscPatterns>({
  approximately: String,
  atLeast: String,
  atMost: String,
  range: String
}, {_id: false});

const NumberSystemPatternsSchema = new Schema<INumberSystemPatterns>({
  percent: String,
  scientific: String,
  decimal: DecimalPatternsSchema,
  currency: CurrencyPatternsSchema,
  miscellaneous: MiscPatternsSchema,
  minimalPairs: {type: Map, of: String}
}, {_id: false});

const NumberSystemDataSchema = new Schema<INSData>({
  name: { type: String, required: true},
  displayName: String,
  digits: String,
  minimumGroupingDigits: Number,
  symbols: NumberSystemSymbolsSchema,
  patterns: NumberSystemPatternsSchema,
  isDefault: { type: Boolean, required: true},
  isNative: { type: Boolean, required: true}
}, {_id: false});

const NumberSystemSchema = new Schema<INumberSystem>({
  tag: String,
  identity: IdentitySchema,
  moduleType: {
    type: String,
    required: true
  },
  main: NumberSystemDataSchema
});

export default model<INumberSystem>("NumberSystem", NumberSystemSchema)
