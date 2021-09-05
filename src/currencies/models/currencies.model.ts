import mongooseService from "../../common/services/mongoose.service";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { ICurrency, ICurrencyData, ICurrencySymbols, ICurrencyFractions, ICurrencyTerritory } from "../interfaces/currencies.interface";
import { PluralKeysSchema } from "../../common/schemas/pluralKeys.schema";

const {Schema, model } = mongooseService.getMongoose();

const CurrencySymbolsSchema = new Schema<ICurrencySymbols>({
  standard: String,
  narrow: String
}, {_id: false});

const CurrencyTerritorySchema = new Schema<ICurrencyTerritory>({
  tag: String,
  from: String,
  to: String,
  isTender: Boolean
}, {_id: false});

const CurrencyFractionsSchema = new Schema<ICurrencyFractions>({
  rounding: Number,
  digits: Number,
  cashRounding: Number,
  cashDigits: Number
}, {_id: false});

export const CurrencyDataSchema = new Schema<ICurrencyData>({
  code: String,
  displayName: String,
  plurals: PluralKeysSchema,
  symbols: CurrencySymbolsSchema,
  fractions: CurrencyFractionsSchema,
  isCurrent: Boolean,
  territories: [CurrencyTerritorySchema]
}, {_id: false});

const CurrencySchema = new Schema<ICurrency>({
  tag: String,
  identity: IdentitySchema,
  moduleType: {
    type: String,
    required: true
  },
  main: CurrencyDataSchema
});

export default model<ICurrency>("Currency", CurrencySchema)
