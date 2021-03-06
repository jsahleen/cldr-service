import { ICalendar } from '../interfaces/calendars.interface';
import Calendar from "../models/calendars.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/calendars.dtos';
import debug, {IDebugger } from 'debug';
import { merge } from 'lodash';

const log: IDebugger = debug('app:calendars-dao');

class CalendarsDAO {

  constructor() {
    log('Created new instance of CalendarsDAO');
  }

  async listCalendars(tags: string[], locales: string[], filters: string[], limit, page): Promise<ICalendar[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Calendar
      .find({$and: [{tag: { $in: locales }},{'main.tag': tags}]})
      .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();
  } 

  async createCalendar(fields: ICreateDTO): Promise<string> {
    const calendar = new Calendar(fields);
    const system = await calendar.save();
    return system._id.toString();
  } 

  async getCalendarById(id: string): Promise<ICalendar | null> {
    return Calendar.findById(id).exec();
  }

  async updateCalendarById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<ICalendar | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await Calendar.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return Calendar.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeCalendarById(id: string): Promise<ICalendar | null> {
    return Calendar.findByIdAndRemove(id);
  }

  async listCalendarsByTagOrType(
    calendar: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<ICalendar[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    switch (calendar) {
      case 'preferred':
        return Calendar
          .find({$and: [{'main.isPreferred': true},{ tag: { $in: locales } }]})
          .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({tag: 'asc'})
          .exec();    
    
      default:
        return Calendar
          .find({$and: [{'main.tag': calendar},{ tag: { $in: locales } }]})
          .select(`_id tag identity moduleType main.tag ${paths.join(' ')}`)
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({tag: 'asc'})
          .exec();
    }
    
  }

  async getTags(): Promise<string[]> {
    return Calendar.distinct('main.tag').exec();
  }

  async getLocales(): Promise<string[]> {
    return Calendar.distinct('tag').exec();
  }

} 

export default new CalendarsDAO();