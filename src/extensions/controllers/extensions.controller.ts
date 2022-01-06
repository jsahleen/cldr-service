import express from 'express';
import extensionsService from '../services/extensions.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:extensions-controller');

export const availableFilters: string[] = [
  'key',
  'displayName',
  'types'
];

class ExtensionsController {

  tags: string[] = [];

  locales: string[] = [];

  constructor() {
    log('Created new instance of ExtensionsController');
    this.getTags();
    this.getLocales();
  }

  async getTags(): Promise<string[]> {
    if (Array.isArray(this.tags) && this.tags.length === 0) {
      this.tags = await extensionsService.getTags();
    }
    return this.tags;
  }

  async getLocales(): Promise<string[]> {
    if (Array.isArray(this.locales) && this.locales.length === 0) {
      this.locales = await extensionsService.getLocales();
    }
    return this.locales;
  }

  listExtensions = async (req: express.Request, res: express.Response) => {
    let { 
      limit = 25, 
      page = 1,
      keys,
      locales,
      filters
    } = req.query;

    if (typeof keys === 'string') {
      keys = keys.split(',');
    } else {
      keys = await this.getTags();
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

    const extensions = await extensionsService.list(keys, locales, filters, limit, page);
    res.status(200).send({extensions: extensions});
  }

  async createExtension(req: express.Request, res: express.Response) {
    const id = await extensionsService.create(req.body);
    res.status(201).send({ _id: id});
    this.tags = await extensionsService.getTags();
    this.locales = await extensionsService.getLocales();
  }

  async getExtensionById(req: express.Request, res: express.Response) {
    const extension = await extensionsService.getById(req.params.id);
    if (!extension) {
      res.status(404).send();
    }
    res.status(200).send(extension);
  }

  async replaceExtensionById(req: express.Request, res: express.Response) {
    log(await extensionsService.replaceById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await extensionsService.getTags();
    this.locales = await extensionsService.getLocales();
  }

  async updateExtensionById(req: express.Request, res: express.Response) {
    log(await extensionsService.updateById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await extensionsService.getTags();
    this.locales = await extensionsService.getLocales();
  }

  async removeExtensionById(req: express.Request, res: express.Response) {
    log(await extensionsService.removeById(req.params.id));
    res.status(204).send();
    this.tags = await extensionsService.getTags();
    this.locales = await extensionsService.getLocales();
  }

  listExtensionsByKeyOrType = async (req: express.Request, res: express.Response) => {
    const key = req.params.key;

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

    const extensions = await extensionsService.listByNameOrType(key, locales, filters, limit, page);
    res.status(200).send({extensions: extensions});
  }
}

export default new ExtensionsController()