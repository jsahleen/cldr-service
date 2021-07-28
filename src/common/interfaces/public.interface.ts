import { Module } from '../types/module.type';

export interface IPublic {
  listByNameOrType: (
    name: string,
    locales: string[],
    filters: string[],
  ) => Promise<Module[] | null>
}