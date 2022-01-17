import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import RelativeTimeDAO from "../daos/time.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/time.dtos";
import { IRelativeTime } from "../interfaces/time.interface";
import debug, {IDebugger } from 'debug';
const log: IDebugger = debug('app:currencies-service');

class RelativeTimeService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of RelativeTimeService');
  }
  
  async list(formats: string[], locales: string[], filters: string[], limit, page): Promise<IRelativeTime[]> {
    return RelativeTimeDAO.listRelativeTimeFormats(formats, locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return RelativeTimeDAO.createRelativeTimeFormats(fields);
  }

  async getById(id: string): Promise<IRelativeTime | null> {
    return RelativeTimeDAO.getRelativeTimeFormatsById(id);
  }

  async replaceById (id: string, fields: IPutDTO | IPatchDTO): Promise<IRelativeTime | null> {
    return RelativeTimeDAO.updateRelativeTimeFormatsById(id, fields);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<IRelativeTime | null> {
    return RelativeTimeDAO.updateRelativeTimeFormatsById(id, fields, true);
  }

  async removeById(id: string): Promise<IRelativeTime | null> {
    return RelativeTimeDAO.removeRelativeTimeFormatsById(id);
  }

  async listByNameOrType(format: string, locales: string[], filters: string[], limit: number, page: number): Promise<IRelativeTime[] | null> {
    return RelativeTimeDAO.listRelativeTimeFormatsByFormat(format, locales, filters, limit, page);
  }

  async getTags() {
    return RelativeTimeDAO.getTags();
  }

  async getLocales() {
    return RelativeTimeDAO.getLocales();
  }

}

export default new RelativeTimeService();