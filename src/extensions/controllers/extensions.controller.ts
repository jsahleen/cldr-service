import express from 'express';
import extensionsService from '../services/extensions.service';
import debug, { IDebugger } from 'debug';
import availableLocales from 'cldr-core/availableLocales.json';
import rootData from 'cldr-localenames-modern/main/root/localeDisplayNames.json'

const log: IDebugger = debug('app:extensions-controller');

const modernLocales = availableLocales.availableLocales.modern;
const availableKeys = Object.keys(rootData.main.root.localeDisplayNames.keys);

export const availableFilters: string[] = [
  'key',
  'displayName',
  'types'
];

class ExtensionsController {

  constructor() {
    log('Created new instance of ExtensionsController');
  }

  async listExtensions(req: express.Request, res: express.Response) {
    let { 
      limit = 25, 
      page = 1,
      keys = availableKeys,
      locales = modernLocales,
      filters = availableFilters
    } = req.query;

    if (typeof keys === 'string') {
      keys = keys.split(',');
    } else {
      keys = availableKeys as string[];
    }

    if (typeof locales === 'string') {
      locales = locales.split(',');
    } else {
      locales = modernLocales as string[];
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
  }

  async getExtensionById(req: express.Request, res: express.Response) {
    const extension = await extensionsService.getById(req.params.id);
    if (!extension) {
      res.status(404).send();
    }
    res.status(200).send(extension);
  }

  async updateExtensionById(req: express.Request, res: express.Response) {
    log(await extensionsService.updateById(req.params.id, req.body));
    res.status(204).send();
  }

  async removeExtensionById(req: express.Request, res: express.Response) {
    log(await extensionsService.removeById(req.params.id));
    res.status(204).send();
  }

  async listExtensionsByKeyOrType(req: express.Request, res: express.Response) {
    const key = req.params.key;

    let { 
      limit = 25, 
      page = 1,
      locales = modernLocales,
      filters = availableFilters
    } = req.query;

    if (typeof locales === 'string') {
      locales = locales.split(',');
    } else {
      locales = modernLocales as string[];
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