import { ModuleTypes } from "../../common/enums/module.enum";
import { IIdentity } from "../../common/interfaces/identity.interface";
import { IModule } from "../../common/interfaces/module.interface";

export interface ITerritoryLanguage {
  tag: string,
  populationPercent: number,
  literacyPercent: number,
  writingPercent: number | null,
  officialStatus: string
}

export interface ITerritoryAltDisplayName {
  type: string,
  value: string
}

export interface ITerritoryCurrency {
  code: string
  from: string 
  to?: string 
  isTender?: boolean
}

export interface ITerritoryData {
    tag: string
    displayName: string,
    altDisplayNames: ITerritoryAltDisplayName[]
    gdp: number,
    population: number,
    literacyPercent: number,
    parentTerritories: string[],
    contains: string[]
    languages: ITerritoryLanguage[],
    currencies: ITerritoryCurrency[]
}

export interface ITerritory extends IModule<ITerritoryData> {
  tag: string
  moduleType: ModuleTypes.TERRITORIES
  identity: IIdentity
  main: ITerritoryData
}
