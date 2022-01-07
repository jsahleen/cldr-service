import express from 'express';
import NumberSystemsService from '../services/numbers.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:numbersystem-controller');

export const availableFilters: string[] = [
  'digits',
  'minimumGroupingDigits',
  'displayName',
  'patterns',
  'symbols',
  'isDefault',
  'isNative'
];

class NumberSystemController {

  tags: string[] = [];

  locales: string[] = [];

  constructor() {
    log('Created new instance of NumberSystemsController');
    this.getTags();
    this.getLocales();
  }

  async getTags(): Promise<string[]> {
    if (Array.isArray(this.tags) && this.tags.length === 0) {
      this.tags = await NumberSystemsService.getTags();
    }
    return this.tags;
  }

  async getLocales(): Promise<string[]> {
    if (Array.isArray(this.locales) && this.locales.length === 0) {
      this.locales = await NumberSystemsService.getLocales();
    }
    return this.locales;
  }

  listNumberSystems = async (req: express.Request, res: express.Response) => {
    let { 
      limit = 25, 
      page = 1,
      systems,
      locales,
      filters
    } = req.query;

    if (typeof systems === 'string') {
      systems = systems.split(',');
    } else {
      systems = await this.getTags();
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

    const numberSystems = await NumberSystemsService.list(systems, locales, filters, limit, page);
    res.status(200).send({numberSystems: numberSystems});
  }

  async createNumberSystem(req: express.Request, res: express.Response) {
    const id = await NumberSystemsService.create(req.body);
    res.status(201).send({ _id: id});
    this.tags = await NumberSystemsService.getTags();
    this.locales = await NumberSystemsService.getLocales();
  }

  async getNumberSystemById(req: express.Request, res: express.Response) {
    const numberSystem = await NumberSystemsService.getById(req.params.id);
    if (!numberSystem) {
      res.status(404).send();
    }
    res.status(200).send(numberSystem);
  }

  async updateNumberSystemById(req: express.Request, res: express.Response) {
    log(await NumberSystemsService.updateById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await NumberSystemsService.getTags();
    this.locales = await NumberSystemsService.getLocales();
  }

  async replaceNumberSystemById(req: express.Request, res: express.Response) {
    log(await NumberSystemsService.replaceById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await NumberSystemsService.getTags();
    this.locales = await NumberSystemsService.getLocales();
  }

  async removeNumberSystemById(req: express.Request, res: express.Response) {
    log(await NumberSystemsService.removeById(req.params.id));
    res.status(204).send();
    this.tags = await NumberSystemsService.getTags();
    this.locales = await NumberSystemsService.getLocales();
  }

  listNumberSystemsByNameOrType = async (req: express.Request, res: express.Response) => {
    const name = req.params.system;

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

    const numberSystems = await NumberSystemsService.listByNameOrType(name, locales, filters, limit, page);
    res.status(200).send({numberSystems: numberSystems});
  }
}

export default new NumberSystemController()