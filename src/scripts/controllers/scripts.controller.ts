import express from 'express';
import scriptsService from '../services/scripts.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:scripts-controller');

export const availableFilters: string[] = [
  'tag',
  'displayName',
  'metadata',
  'languages'
];

class ScriptsController {

  tags: string[] = [];

  locales: string[] = [];

  constructor() {
    log('Created new instance of ScriptsController');
    this.getTags();
    this.getLocales();
  }

  private async getTags(): Promise<string[]> {
    if (Array.isArray(this.tags) && this.tags.length === 0) {
      this.tags = await scriptsService.getTags();
    }
    return this.tags;
  }

  private async getLocales(): Promise<string[]> {
    if (Array.isArray(this.locales) && this.locales.length === 0) {
      this.locales = await scriptsService.getLocales();
    }
    return this.locales;
  }

  listScripts = async (req: express.Request, res: express.Response) => {
    let { 
      limit = 25, 
      page = 1,
      tags,
      locales,
      filters
    } = req.query;

    if (typeof tags === 'string') {
      tags = tags.split(',');
    } else {
      tags = await this.getTags();
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

    const scripts = await scriptsService.list(tags, locales, filters, limit, page);
    res.status(200).send({scripts: scripts});
  }

  createScript = async (req: express.Request, res: express.Response) => {
    const id = await scriptsService.create(req.body);
    res.status(201).send({ _id: id});
    this.tags = await scriptsService.getTags();
    this.locales = await scriptsService.getLocales();
  }

  getScriptById = async (req: express.Request, res: express.Response) => {
    const script = await scriptsService.getById(req.params.id);
    if (!script) {
      res.status(404).send();
    }
    res.status(200).send(script);
  }

  updateScriptById = async (req: express.Request, res: express.Response) => {
    log(await scriptsService.updateById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await scriptsService.getTags();
    this.locales = await scriptsService.getLocales();
  }

  replaceScriptById = async (req: express.Request, res: express.Response) => {
    log(await scriptsService.replaceById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await scriptsService.getTags();
    this.locales = await scriptsService.getLocales();
  }

  removeScriptById = async (req: express.Request, res: express.Response) => {
    log(await scriptsService.removeById(req.params.id));
    res.status(204).send();
    this.tags = await scriptsService.getTags();
    this.locales = await scriptsService.getLocales();
  }

  listScriptsByTagOrType = async (req: express.Request, res: express.Response) => {
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

    const scripts = await scriptsService.listByNameOrType(tag, locales, filters, limit, page);
    res.status(200).send({scripts: scripts});
  }
}

export default new ScriptsController()