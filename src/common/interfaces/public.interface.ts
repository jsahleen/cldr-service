import { Module } from '../types/module.type';

export interface IPublic {
  listByNameOrType: (
    name: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ) => Promise<Module[] | null>
  getTags: () => Promise<string[]>
  getLocales: () => Promise<string[]>
}