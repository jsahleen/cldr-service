import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import languagesDAO from "../daos/languages.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/languages.dtos";
import { ILanguage } from "../interfaces/languages.interface";
import debug, {IDebugger } from 'debug';
const log: IDebugger = debug('app:currencies-service');

class LanguagesService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of CurrencyService');
  }
  
  async list(locales: string[], filters: string[], limit, page): Promise<ILanguage[]> {
    return languagesDAO.listLanguages(locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return languagesDAO.createLanguage(fields);
  }

  async getById(id: string): Promise<ILanguage | null> {
    return languagesDAO.getLanguageById(id);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<void> {
    return languagesDAO.updateLanguageById(id, fields);
  }

  async removeById(id: string): Promise<void> {
    return languagesDAO.removeLanguageById(id);
  }

  async listByNameOrType(category: string, locales: string[], filters: string[], limit: number, page: number): Promise<ILanguage[] | null> {
    return languagesDAO.listLanguagesByTagOrFamily(category, locales, filters, limit, page);
  }

  async getLanguageTags() {
    return languagesDAO.getLanguageTags();
  }

}

export default new LanguagesService();