import mongooseService from "../../common/services/mongoose.service";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { ITerritory, ITerritoryAltDisplayName, ITerritoryData, ITerritoryLanguage, ITerritoryCurrency } from "../interfaces/territories.interface";

const {Schema, model } = mongooseService.getMongoose();

const TerritoryLanguageSchema = new Schema<ITerritoryLanguage>({
  tag: String,
  populationPercent: Number,
  literacyPercent: Number,
  writingPercent: Number,
  officialStatus: String
}, {_id: false});

const TerritoryCurrenciesSchema = new Schema<ITerritoryCurrency>({
  code: String,
  from: String,
  to: String,
  isTender: Boolean
}, {_id: false});

const TerritoryAltDisplayNameSchema = new Schema<ITerritoryAltDisplayName>({
  type: String,
  value: String
}, {_id: false});

export const TerritoryDataSchema = new Schema<ITerritoryData>({
  tag: {type: String, required: true},
  displayName: String,
  altDisplayNames: [TerritoryAltDisplayNameSchema],
  gdp: Number,
  population: Number,
  literacyPercent: Number,
  parentTerritories: [String],
  contains: [String],
  languages: [TerritoryLanguageSchema],
  currencies: [TerritoryCurrenciesSchema]
}, {_id: false});

const TerritorySchema = new Schema<ITerritory>({
  tag: {type: String, required: true},
  moduleType: {
    type: String,
    required: true
  },
  identity: {type: IdentitySchema, required: true},
  main: TerritoryDataSchema
});

export default model<ITerritory>("Territory", TerritorySchema)
