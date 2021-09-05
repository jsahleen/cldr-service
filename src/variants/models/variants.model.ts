import mongooseService from "../../common/services/mongoose.service";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { IVariant, IVariantData } from "../interfaces/variants.interface";

const {Schema, model } = mongooseService.getMongoose();

export const VariantDataSchema = new Schema<IVariantData>({
  tag: {type: String, required: true},
  displayName: String,
}, {_id: false});

const VariantSchema = new Schema<IVariant>({
  tag: {type: String, required: true},
  identity: IdentitySchema,
  moduleType: {
    type: String,
    required: true
  },
  main: VariantDataSchema
});

export default model<IVariant>("Variant", VariantSchema)
