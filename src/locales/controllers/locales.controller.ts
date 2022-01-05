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

  constructor() {
    log('Created new instance of LocalesController');
  }

  async listLocales(req: express.Request, res: express.Response) {
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
      locales = await localesService.getLocales();
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
      const before = locales.length > limit ? limit : 1
      const availableTags = await localesService.getTags();
      tags = availableTags.slice(0, before) as string[];
    }

    const loc = await localesService.list(tags, locales, filters, limit, page);
    res.status(200).send({locales: loc});
  }

  async createLocale(req: express.Request, res: express.Response) {
    const id = await localesService.create(req.body);
    res.status(201).send({ _id: id});
  }

  async getLocaleById(req: express.Request, res: express.Response) {
    const locale = await localesService.getById(req.params.id);
    if (!locale) {
      res.status(404).send();
    }
    res.status(200).send(locale);
  }

  async updateLocaleById(req: express.Request, res: express.Response) {
    log(await localesService.updateById(req.params.id, req.body));
    res.status(204).send();
  }

  async replaceLocaleById(req: express.Request, res: express.Response) {
    log(await localesService.replaceById(req.params.id, req.body));
    res.status(204).send();
  }

  async removeLocaleById(req: express.Request, res: express.Response) {
    log(await localesService.removeById(req.params.id));
    res.status(204).send();
  }

  async listLocalesByTagOrType(req: express.Request, res: express.Response) {
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
      locales = await localesService.getLocales();
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