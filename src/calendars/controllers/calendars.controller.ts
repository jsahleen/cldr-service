import express from 'express';
import CalendarsService from '../services/calendars.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:calendars-controller');

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

  tags: string[] = [];

  locales: string[] = [];

  constructor() {
    log('Created new instance of CalendarsController');
    this.getLocales();
    this.getTags();
  }

  async getTags(): Promise<string[]> {
    if (Array.isArray(this.tags) && this.tags.length === 0) {
      this.tags = await CalendarsService.getTags();
    }
    return this.tags;
  }

  async getLocales(): Promise<string[]> {
    if (Array.isArray(this.locales) && this.locales.length === 0) {
      this.locales = await CalendarsService.getLocales();
    }
    return this.locales;
  }

   listCalendars = async (req: express.Request, res: express.Response) => {
    let { 
      limit = 25, 
      page = 1,
      calendars,
      locales,
      filters
    } = req.query;

    if (typeof calendars === 'string') {
      calendars = calendars.split(',');
    } else {
      calendars = await this.getTags();
    }

    if (typeof locales === 'string') {
      locales = locales.split(',');
    } else {
      locales = await this.getLocales();
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
    this.tags = await CalendarsService.getTags();
    this.locales = await CalendarsService.getLocales();
    res.status(201).send({ _id: id});
  }

  async getCalendarById(req: express.Request, res: express.Response) {
    const calendar = await CalendarsService.getById(req.params.id);
    if (!calendar) {
      res.status(404).send();
    }
    res.status(200).send(calendar);
  }

  async replaceById(req: express.Request, res: express.Response) {
    log(await CalendarsService.replaceById(req.params.id, req.body));
    this.tags = await CalendarsService.getTags();
    this.locales = await CalendarsService.getLocales();
    res.status(204).send();
  }

  async updateCalendarById(req: express.Request, res: express.Response) {
    log(await CalendarsService.updateById(req.params.id, req.body));
    this.tags = await CalendarsService.getTags();
    this.locales = await CalendarsService.getLocales();
    res.status(204).send();
  }

  async removeCalendarById(req: express.Request, res: express.Response) {
    log(await CalendarsService.removeById(req.params.id));
    this.tags = await CalendarsService.getTags();
    this.locales = await CalendarsService.getLocales();
    res.status(204).send();
  }

  listCalendarsByNameOrType = async (req: express.Request, res: express.Response) => {
    const calendar = req.params.calendar;

    let { 
      limit = 25, 
      page = 1,
      locales,
      filters
    } = req.query;

    if (typeof locales === 'string') {
      locales = locales.split(',');
    } else {
      locales = await this.getLocales();
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