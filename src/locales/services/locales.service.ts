import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import localesDAO from "../daos/locales.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/locales.dtos";
import { ILocale } from "../interfaces/locales.interface";
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:locales-service');

class LocalesService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of LocalesService');
  }
  
  async list(tags: string[], locales: string[], filters: string[], limit, page): Promise<ILocale[]> {
    return localesDAO.listLocales(tags, locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return localesDAO.createLocale(fields);
  }

  async getById(id: string): Promise<ILocale | null> {
    return localesDAO.getLocaleById(id);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<ILocale | null> {
    return localesDAO.updateLocaleById(id, fields, true);
  }

  async replaceById(id: string, fields: IPutDTO | IPatchDTO): Promise<ILocale | null> {
    return localesDAO.updateLocaleById(id, fields);
  }

  async removeById(id: string): Promise<void> {
    return localesDAO.removeLocaleById(id);
  }

  async listByNameOrType(category: string, locales: string[], filters: string[], limit: number, page: number): Promise<ILocale[] | null> {
    return localesDAO.listLocalesByTagOrType(category, locales, filters, limit, page);
  }

  async getTags() {
    return localesDAO.getTags();
  }

  async getLocales() {
    return localesDAO.getLocales();
  }

}

export default new LocalesService();