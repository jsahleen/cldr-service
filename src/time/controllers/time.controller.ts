import express from 'express';
import RelativeTimeService from '../services/time.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:time-controller');

export const availableFilters: string[] = [
  'era',
  'year',
  'quarter',
  'month',
  'week',
  'weekOfMonth',
  'day',
  'dayOfYear',
  'weekday',
  'weekdayOfMonth',
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'dayPeriod',
  'hour',
  'minute',
  'second',
  'zone',
];

class RelativeTimeController {

  tags: string[] = [];

  locales: string[] = [];

  constructor() {
    log('Created new instance of RelativeTimeController');
    this.getTags();
    this.getLocales();
  }

  private async getTags(): Promise<string[]> {
    if (Array.isArray(this.tags) && this.tags.length === 0) {
      this.tags = await RelativeTimeService.getTags();
    }
    return this.tags;
  }

  private async getLocales(): Promise<string[]> {
    if (Array.isArray(this.locales) && this.locales.length === 0) {
      this.locales = await RelativeTimeService.getLocales();
    }
    return this.locales;
  }

  listRelativeTimeFormats = async (req: express.Request, res: express.Response) => {
    let { 
      limit = 25, 
      page = 1,
      formats,
      locales,
      filters
    } = req.query;

    if (typeof formats === 'string') {
      formats = formats.split(',');
    } else {
      formats = await this.getTags();
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

    const relativeTimeFormats = await RelativeTimeService.list(formats, locales, filters, limit, page);
    res.status(200).send({formats: relativeTimeFormats});
  }

  createRelativeTimeFormats = async (req: express.Request, res: express.Response) => {
    const id = await RelativeTimeService.create(req.body);
    res.status(201).send({ _id: id});
    this.tags = await RelativeTimeService.getTags();
    this.locales = await RelativeTimeService.getLocales();
  }

  getRelativeTimeFormatsById = async (req: express.Request, res: express.Response) => {
    const relativeTimeFormats = await RelativeTimeService.getById(req.params.id);
    if (!relativeTimeFormats) {
      res.status(404).send();
    }
    res.status(200).send(relativeTimeFormats);
  }

  replaceRelativeTimeFormatsById = async (req: express.Request, res: express.Response) => {
    log(await RelativeTimeService.replaceById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await RelativeTimeService.getTags();
    this.locales = await RelativeTimeService.getLocales();
  }

  updateRelativeTimeFormatsById = async (req: express.Request, res: express.Response) => {
    log(await RelativeTimeService.updateById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await RelativeTimeService.getTags();
    this.locales = await RelativeTimeService.getLocales();
  }

  removeRelativeTimeFormatsById = async (req: express.Request, res: express.Response) => {
    log(await RelativeTimeService.removeById(req.params.id));
    res.status(204).send();
    this.tags = await RelativeTimeService.getTags();
    this.locales = await RelativeTimeService.getLocales();
  }

  listRelativeTimeFormatsByFormat = async (req: express.Request, res: express.Response) => {
    const format = req.params.format;

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

    const formats = await RelativeTimeService.listByNameOrType(format, locales, filters, limit, page);
    res.status(200).send({formats: formats});
  }
}

export default new RelativeTimeController()