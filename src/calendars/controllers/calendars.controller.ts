import express from 'express';
import CalendarsService from '../services/calendars.service';
import debug, { IDebugger } from 'debug';
import CLDRUTIL from '../../common/util/common.util';

const log: IDebugger = debug('app:calendars-controller');

const availableLocales = CLDRUTIL.getAvailableLocales();
const rootData = CLDRUTIL.getRootLocaleData('localenames', 'localeDisplayNames');
const availableCalendars = Object.keys(rootData.main[CLDRUTIL.rootLocale].localeDisplayNames.types.calendar)
  .filter(key => key !== 'iso8601');
availableCalendars.push('generic');

export const availableFilters: string[] = [
  'displayName',
  'dateNumberSystem',
  'names',
  'formats',
  'patterns',
  'skeletons',
  'isPreferred',
  'calendarSystem'
];

class CalendarsController {

  constructor() {
    log('Created new instance of CalendarsController');
  }

  async listCalendars(req: express.Request, res: express.Response) {
    let { 
      limit = 25, 
      page = 1,
      calendars = availableCalendars,
      locales = availableLocales,
      filters = availableFilters
    } = req.query;

    if (typeof calendars === 'string') {
      calendars = calendars.split(',');
    } else {
      calendars = availableCalendars;
    }

    if (typeof locales === 'string') {
      locales = locales.split(',');
    } else {
      locales = availableLocales as string[];
    }

    if (typeof filters === 'string') {
      filters = filters.split(',');
    } else {
      filters = availableFilters as string[];
    }
    
    limit = parseInt(limit as string, 10);
    page = parseInt(page as string, 10);

    if (isNaN(limit) || isNaN(page)) {
      res.status(400).send();
    }

    const results = await CalendarsService.list(calendars, locales, filters, limit, page);
    res.status(200).send({calendars: results});
  }

  async createCalendar(req: express.Request, res: express.Response) {
    const id = await CalendarsService.create(req.body);
    res.status(201).send({ _id: id});
  }

  async getCalendarById(req: express.Request, res: express.Response) {
    const calendar = await CalendarsService.getById(req.params.id);
    if (!calendar) {
      res.status(404).send();
    }
    res.status(200).send(calendar);
  }

  async updateCalendarById(req: express.Request, res: express.Response) {
    log(await CalendarsService.updateById(req.params.id, req.body));
    res.status(204).send();
  }

  async removeCalendarById(req: express.Request, res: express.Response) {
    log(await CalendarsService.removeById(req.params.id));
    res.status(204).send();
  }

  async listCalendarsByNameOrType(req: express.Request, res: express.Response) {
    const calendar = req.params.calendar;

    let { 
      limit = 25, 
      page = 1,
      locales = availableLocales,
      filters = availableFilters
    } = req.query;

    if (typeof locales === 'string') {
      locales = locales.split(',');
    } else {
      locales = availableLocales as string[];
    }

    if (typeof filters === 'string') {
      filters = filters.split(',');
    } else {
      filters = availableFilters as string[];
    }
    
    limit = parseInt(limit as string, 10);
    page = parseInt(page as string, 10);

    if (isNaN(limit) || isNaN(page)) {
      res.status(400).send();
    }

    const results = await CalendarsService.listByNameOrType(calendar, locales, filters, limit, page);
    res.status(200).send({calendars: results});
  }
}

export default new CalendarsController()