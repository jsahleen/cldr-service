import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import CalendarsDAO from "../daos/calendars.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/calendars.dtos";
import { ICalendar } from "../interfaces/calendars.interface";
import debug, {IDebugger } from 'debug';
const log: IDebugger = debug('app:calenders-service');

class CalendarsService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of CalendarsService');
  }
  
  async list(tags: string[], locales: string[], filters: string[], limit, page): Promise<ICalendar[]> {
    return CalendarsDAO.listCalendars(tags, locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return CalendarsDAO.createCalendar(fields);
  }

  async getById(id: string): Promise<ICalendar | null> {
    return CalendarsDAO.getCalendarById(id);
  }

  async replaceById (id: string, fields: IPutDTO | IPatchDTO): Promise<ICalendar | null> {
    return CalendarsDAO.updateCalendarById(id, fields);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<ICalendar | null> {
    return CalendarsDAO.updateCalendarById(id, fields, true);
  }

  async removeById(id: string): Promise<void> {
    return CalendarsDAO.removeCalendarById(id);
  }

  async listByNameOrType(calendar: string, locales: string[], filters: string[], limit: number, page: number): Promise<ICalendar[] | null> {
    return CalendarsDAO.listCalendarsByTagOrType(calendar, locales, filters, limit, page);
  }

  async getTags(): Promise<string[]> {
    return CalendarsDAO.getTags();
  }

  async getLocales(): Promise<string[]> {
    return CalendarsDAO.getLocales();
  }

}

export default new CalendarsService();