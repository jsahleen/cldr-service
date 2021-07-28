import MongooseService from "../services/mongoose.service";
import { IIdentity, IVersions } from "../interfaces/identity.interface";
import { Model } from "mongoose";
const Schema = MongooseService.getMongoose().Schema;

export interface IdentityModel extends Model<IIdentity> {
  locale: () => string
}

export const VersionsSchema = new Schema<IVersions>({
  cldr: String,
  unicode: String
}, {_id: false});

export const IdentitySchema = new Schema<IIdentity, IdentityModel>({
  language: {
    type: String,
    required: true
  },
  script: {
    type: String,
    required: false
  },
  territory: {
    type: String,
    required: false
  },
  variant: {
    type: String,
    required: false
  },
  versions: VersionsSchema
}, {_id: false});

IdentitySchema.virtual('locale').get(function(this: IIdentity) {
  const {language, script, territory, variant} = this;
  const elements: string[] = [];
  elements.push(language);
  if (script) {
    elements.push(script);
  }
  if (territory) {
    elements.push(territory)
  }
  if (variant) {
    elements.push(variant)
  }
  return elements.join('-');
})
