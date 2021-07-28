import { Module } from '../types/module.type';

export interface IAdmin {
  list: (locales: string[], filters: string[], limit: number, page: number) => Promise<Module[]>
  create: (fields) => Promise<string>
  getById: (id: string) => Promise<Module | null>
  updateById: (id: string, fields) => Promise<void>
  replaceById:  (id: string, fields) => Promise<void>
  removeById: (id: string) => Promise<void>
}
