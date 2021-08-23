import express from 'express';
import scriptsService from '../services/scripts.service';
import debug, { IDebugger } from 'debug';
import availableLocales from 'cldr-core/availableLocales.json';

const log: IDebugger = debug('app:currencies-controller');

const modernLocales = availableLocales.availableLocales.modern;

export const availableFilters: string[] = [
  'tag',
  'displayName',
  'metadata',
  'languages'
];

class ScriptsController {

  constructor() {
    log('Created new instance of ScriptsController');
  }

  async listScripts(req: express.Request, res: express.Response) {
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

    const scripts = await scriptsService.list(locales, filters, limit, page);
    res.status(200).send({scripts: scripts});
  }

  async createScript(req: express.Request, res: express.Response) {
    const id = await scriptsService.create(req.body);
    res.status(201).send({ _id: id});
  }

  async getScriptById(req: express.Request, res: express.Response) {
    const script = await scriptsService.getById(req.params.id);
    if (!script) {
      res.status(404).send();
    }
    res.status(200).send(script);
  }

  async updateScriptById(req: express.Request, res: express.Response) {
    log(await scriptsService.updateById(req.params.id, req.body));
    res.status(204).send();
  }

  async removeScriptById(req: express.Request, res: express.Response) {
    log(await scriptsService.removeById(req.params.id));
    res.status(204).send();
  }

  async listScriptsByTagOrType(req: express.Request, res: express.Response) {
    const tag = req.params.tag;

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

    const scripts = await scriptsService.listByNameOrType(tag, locales, filters, limit, page);
    res.status(200).send({scripts: scripts});
  }
}

export default new ScriptsController()