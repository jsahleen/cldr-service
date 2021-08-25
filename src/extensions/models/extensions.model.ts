import mongooseService from "../../common/services/mongoose.service";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { IExtension, IExtensionData } from "../interfaces/extensions.interface";

const {Schema, model } = mongooseService.getMongoose();

const ExtensionDataSchema = new Schema<IExtensionData>({
  key: String,
  displayName: String,
  types: {
    type: Map,
    of: String
  }
});

const ExtensionSchema = new Schema<IExtension>({
  tag: String,
  moduleType: {type: String, required: true},
  identity: IdentitySchema,
  main: ExtensionDataSchema
});

export default model<IExtension>("Extension", ExtensionSchema)
