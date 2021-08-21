import mongooseService from "../../common/services/mongoose.service";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { ICurrency, ICurrencyData, ICurrencySymbols, ICurrencyFractions, ICurrencyTerritory } from "../interfaces/currencies.interface";
import { PluralKeysSchema } from "../../common/schemas/pluralKeys.schema";

const {Schema, model } = mongooseService.getMongoose();

const ICurrencySymbolsSchema = new Schema<ICurrencySymbols>({
  standard: String,
  narrow: String
}, {_id: false});

const ICurrencyTerritorySchema = new Schema<ICurrencyTerritory>({
  territory: String,
  from: String,
  to: String,
  isTender: Boolean
}, {_id: false});

const ICurrencyFractionsSchema = new Schema<ICurrencyFractions>({
  rounding: Number,
  digits: Number,
  cashRounding: Number,
  cashDigits: Number
}, {_id: false});

const ICurrencyDataSchema = new Schema<ICurrencyData>({
  code: String,
  displayName: String,
  plurals: PluralKeysSchema,
  symbols: ICurrencySymbolsSchema,
  fractions: ICurrencyFractionsSchema,
  isCurrent: Boolean,
  territories: [ICurrencyTerritorySchema]
}, {_id: false});

const CurrencySchema = new Schema<ICurrency>({
  tag: String,
  identity: IdentitySchema,
  moduleType: {
    type: String,
    required: true
  },
  main: ICurrencyDataSchema
});

export default model<ICurrency>("Currency", CurrencySchema)
