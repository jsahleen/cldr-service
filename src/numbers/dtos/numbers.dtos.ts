import { INumberSystem } from "../interfaces/numbers.interface";

export type IPutDTO = INumberSystem & {id: string};

export type IPatchDTO = Partial<INumberSystem> & {id: string};

export type ICreateDTO = INumberSystem;