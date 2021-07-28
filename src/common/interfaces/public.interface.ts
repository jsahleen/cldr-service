import { Module } from '../types/module.type';

export interface IPublic {
  listByCategory: (
    category: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ) => Promise<Module[] | null>

  getByCategoryAndLocale: (
    category: string,
    locale: string,
    filters: string[],
  ) => Promise<Module | null>
}
