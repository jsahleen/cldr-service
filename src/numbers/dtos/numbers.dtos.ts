import { INumberSystem } from "../interfaces/numbers.interface";

export type IPutDTO = INumberSystem & {_id: string};

export type IPatchDTO = Partial<INumberSystem> & {_id: string};

export type ICreateDTO = INumberSystem;
