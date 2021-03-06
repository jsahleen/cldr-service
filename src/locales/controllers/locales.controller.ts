import express from 'express';
import localesService from '../services/locales.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:locales-controller');

export const availableFilters: string[] = [
  'tag',
  'parentLocale',
  'likelySubtags',
  'patterns',
  'language',
  'script',
  'territory',
  'variants'
];

class LocalesController {
  
  tags: string[] = [];

  locales: string[] = [];

  constructor() {
    log('Created new instance of LocalesController');
    this.getTags();
    this.getLocales();
  }

  private async getTags(): Promise<string[]> {
    if (Array.isArray(this.tags) && this.tags.length === 0) {
      this.tags = await localesService.getTags();
    }
    return this.tags;
  }

  private async getLocales(): Promise<string[]> {
    if (Array.isArray(this.locales) && this.locales.length === 0) {
      this.locales = await localesService.getLocales();
    }
    return this.locales;
  }

  listLocales = async (req: express.Request, res: express.Response) => {
    let { 
      limit = 25, 
      page = 1,
      tags,
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

    if (typeof tags === 'string') {
      tags = tags.split(',');
    } else {
      tags = await this.getTags();
    }

    if (tags.length > limit) {
      tags = tags.slice(0, limit);
    }

    const loc = await localesService.list(tags, locales, filters, limit, page);
    res.status(200).send({locales: loc});
  }

  createLocale = async (req: express.Request, res: express.Response) => {
    const id = await localesService.create(req.body);
    res.status(201).send({ _id: id});
    this.tags = await localesService.getTags();
    this.locales = await localesService.getLocales();
  }

  getLocaleById = async (req: express.Request, res: express.Response) => {
    const locale = await localesService.getById(req.params.id);
    if (!locale) {
      res.status(404).send();
    }
    res.status(200).send(locale);
  }

  updateLocaleById = async (req: express.Request, res: express.Response) => {
    log(await localesService.updateById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await localesService.getTags();
    this.locales = await localesService.getLocales();
  }

  replaceLocaleById = async (req: express.Request, res: express.Response) => {
    log(await localesService.replaceById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await localesService.getTags();
    this.locales = await localesService.getLocales();
  }

  removeLocaleById = async (req: express.Request, res: express.Response) => {
    log(await localesService.removeById(req.params.id));
    res.status(204).send();
    this.tags = await localesService.getTags();
    this.locales = await localesService.getLocales();
  }

  listLocalesByTagOrType = async (req: express.Request, res: express.Response) => {
    const tag = req.params.tag;

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

    const loc = await localesService.listByNameOrType(tag, locales, filters, limit, page);
    res.status(200).send({locales: loc});
  }
}

export default new LocalesController()