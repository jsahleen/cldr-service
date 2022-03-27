import { IModule } from "../../common/interfaces/module.interface";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { Types } from "mongoose";
import { ModuleTypes } from "../../common/enums/module.enum";

export interface IZoneRegionFormats {
  generic: string
  standard: string
  daylight: string
}

export interface IZoneFormats {
  hour: string
  gmt: string
  gmtZero: string
  region: IZoneRegionFormats
  fallback: string
}

export interface IZoneComponents {
  macroRegion: string
  territory?: string
  exemplarCity: string
}

export interface IMetaZoneNameTypes {
  generic?: string
  standard: string
  daylight?: string
}

export interface IMetaZoneNames {
  long?: IMetaZoneNameTypes
  short?: IMetaZoneNameTypes
}

export interface IMetaZone {
  identifier: string
  from?: string
  to?: string
  displayNames: IMetaZoneNames
  current: boolean
}

export interface IZoneData {
  identifier: string
  components: IZoneComponents
  exemplarCityName: string
  formats: IZoneFormats
  metaZones?: IMetaZone[]
}

export interface IZone extends IModule<IZoneData> {
  _id?: Types.ObjectId
  tag: string
  moduleType: ModuleTypes.ZONES
  identity: IIdentity
  main: IZoneData
}