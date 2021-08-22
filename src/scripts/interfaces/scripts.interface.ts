import { ModuleTypes } from "../../common/enums/module.enum";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { IModule } from "../../common/interfaces/module.interface";

export interface IScriptLanguage {
  tag: string
  scriptStatus: 'primary' | 'secondary'
}

export interface IScriptAge {
  m_version: number
}

export interface IScriptMetadata {
  rank: number
  age: {
    m_version: number
  },
  sampleChar: string
  idUsage: string
  rtl: boolean
  lbLetters: boolean
  hasCase: boolean
  shapingReq: boolean
  ime: boolean
  density: number
  originCountry: string
  likelyLanguage: string
}

export interface IScriptData {
  tag: string
  displayName: string
  metadata: IScriptMetadata | Record<string, never>
  languages: IScriptLanguage[]
}

export interface IScript extends IModule<IScriptData> {
  tag: string
  moduleType: ModuleTypes.SCRIPTS
  identity: IIdentity
  main: IScriptData
}

