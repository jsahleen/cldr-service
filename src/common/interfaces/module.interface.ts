import { IIdentity } from "./identity.interface";

export interface IModule<T> {
  tag: string
  identity: IIdentity
  moduleType: string
  main: T  
}
