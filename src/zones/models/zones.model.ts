import { model, Schema } from "mongoose";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { 
  IMetaZone, IMetaZoneNames, IMetaZoneNameTypes, IZone,
  IZoneComponents, IZoneData, IZoneFormats, IZoneRegionFormats 
} from "../interfaces/zones.interface";


export const MetaZoneNameTypesSchema = new Schema<IMetaZoneNameTypes>({
  generic: String,
  standard: String,
  daylight: String
}, {_id: false});

export const MetaZoneNamesSchema = new Schema<IMetaZoneNames>({
  long: MetaZoneNameTypesSchema,
  short: MetaZoneNameTypesSchema
}, {_id: false})

export const MetaZoneSchema = new Schema<IMetaZone>({
  identifier: String,
  from: String,
  to: String,
  displayNames: MetaZoneNamesSchema,
  current: Boolean
}, {_id: false});

export const ZoneComponentsSchema = new Schema<IZoneComponents>({
  macroRegion: String,
  territory: String,
  exemplarCity: String
}, {_id: false});

export const ZoneRegionFormatsSchema = new Schema<IZoneRegionFormats>({
  generic: String,
  standard: String,
  daylight: String
}, {_id: false})

export const ZoneFormatsSchema = new Schema<IZoneFormats>({
  hour: String,
  gmt: String,
  gmtZero: String,
  region: ZoneRegionFormatsSchema,
  fallback: String,
}, {_id: false})

export const ZoneDataSchema = new Schema<IZoneData>({
  identifier: String,
  components: ZoneComponentsSchema,
  exemplarCityName: String,
  formats: ZoneFormatsSchema,
  metaZones: [MetaZoneSchema]
}, {_id: false});

export const ZoneSchema = new Schema<IZone>({
  tag: String,
  moduleType: {
    type: String,
    required: true
  },
  identity: IdentitySchema,
  main: ZoneDataSchema
});

export default model<IZone>("Zone", ZoneSchema)
