export interface ICRUD {
  list: (limit: number, page: number) => Promise<unknown>
  add: (fields) => Promise<string>
  getById: (id: string) => Promise<unknown | null>
  updateById: (id: string, fields) => Promise<unknown | null>
  removeById: (id: string) => Promise<void>
}
