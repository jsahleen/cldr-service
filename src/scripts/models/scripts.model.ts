import mongooseService from "../../common/services/mongoose.service";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { IScript, IScriptData, IScriptLanguage, IScriptMetadata, IScriptAge } from "../interfaces/scripts.interface";

const {Schema, model } = mongooseService.getMongoose();

const ScriptLanguageSchema = new Schema<IScriptLanguage>({
  tag: String,
  scriptStatus: String
}, {_id: false});

const ScriptAgeSchema = new Schema<IScriptAge>({
  m_version: Number
}, {_id: false});

const ScriptMetadataSchema = new Schema<IScriptMetadata>({
  rank: Number,
  age: ScriptAgeSchema,
  sampleChar: String,
    idUsage: String,
    rtl: Boolean,
    lbLetters: Boolean,
    hasCase: Boolean,
    shapingReq: Boolean,
    ime: Boolean,
    density: Number,
    originCountry: String,
    likelyLanguage: String,
}, {_id: false});

export const ScriptDataSchema = new Schema<IScriptData>({
  tag: {type: String, required: true},
  displayName: String,
  metadata: ScriptMetadataSchema,
  languages: [ScriptLanguageSchema]
}, {_id: false});

const ScriptSchema = new Schema<IScript>({
  tag: {type: String, required: true},
  identity: IdentitySchema,
  moduleType: {
    type: String,
    required: true
  },
  main: ScriptDataSchema
});

export default model<IScript>("Script", ScriptSchema)
