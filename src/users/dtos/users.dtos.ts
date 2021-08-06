import { IUser } from "../interfaces/users.interface";

export type IPutDTO = IUser & {_id: string};

export type IPatchDTO = Partial<IUser> & {_id: string};

export type ICreateDTO = IUser;
