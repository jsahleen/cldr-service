import MongooseService from "../services/mongoose.service";
import { IPluralKeys } from "../interfaces/pluralkeys.interface";

const Schema = MongooseService.getMongoose().Schema;

export const PluralKeysSchema = new Schema<IPluralKeys>({
  zero: String,
  one: String,
  two: String,
  few: String,
  many: String,
  other: String
}, {_id: false});
