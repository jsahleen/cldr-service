import { ITerritory } from "../interfaces/territories.interface";

export type IPutDTO = ITerritory;

export type IPatchDTO = Partial<ITerritory>;

export type ICreateDTO = ITerritory;
