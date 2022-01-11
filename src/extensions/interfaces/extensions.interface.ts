import { Types } from "mongoose";
import { ModuleTypes } from "../../common/enums/module.enum";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { IModule } from "../../common/interfaces/module.interface";

export interface IExtensionData {
  key: string
  displayName: string
  types: {
    [key: string]: string
  }
}

export interface IExtension extends IModule<IExtensionData> {
  _id?: Types.ObjectId
  tag: string
  moduleType: ModuleTypes.EXTENSIONS
  identity: IIdentity
  main: IExtensionData
}
