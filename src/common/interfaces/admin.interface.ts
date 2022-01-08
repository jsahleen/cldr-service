import { Module } from '../types/module.type';

export interface IAdmin {
  list: (tags: string[], locales: string[], filters: string[], list, page) => Promise<Module[]>
  create: (fields) => Promise<string>
  getById: (id: string) => Promise<Module | null>
  updateById: (id: string, fields) => Promise<Module | null>
  replaceById: (id: string, fields) => Promise<Module | null>
  removeById: (id: string) => Promise<Module | null>
}
