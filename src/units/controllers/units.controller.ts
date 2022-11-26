import express from 'express';
import unitsService from '../services/units.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:units-controller');

export const availableFilters: string[] = [
  'tag',
  'subtags',
  'gender',
  'displayNames',
  'patterns'
];

class UnitsController {

  tags: string[] = [];

  locales: string[] = [];

  constructor() {
    log('Created new instance of UnitsController');
    this.getTags();
    this.getLocales();
  }

  private async getTags(): Promise<string[]> {
    if (Array.isArray(this.tags) && this.tags.length === 0) {
      this.tags = await unitsService.getTags();
    }
    return this.tags;
  }

  private async getLocales(): Promise<string[]> {
    if (Array.isArray(this.locales) && this.locales.length === 0) {
      this.locales = await unitsService.getLocales();
    }
    return this.locales;
  }
  
  listUnits = async (req: express.Request, res: express.Response) => {
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

    const units = await unitsService.list(tags, locales, filters, limit, page);
    res.status(200).send({units: units});
  }

  createUnit = async (req: express.Request, res: express.Response) => {
    const id = await unitsService.create(req.body);
    res.status(201).send({ _id: id});
    this.tags = await unitsService.getTags();
    this.locales = await unitsService.getLocales();
  }

  getUnitById = async (req: express.Request, res: express.Response) => {
    const variant = await unitsService.getById(req.params.id);
    if (!variant) {
      res.status(404).send();
    }
    res.status(200).send(variant);
  }

  updateUnitById = async (req: express.Request, res: express.Response) => {
    log(await unitsService.updateById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await unitsService.getTags();
    this.locales = await unitsService.getLocales();
  }

  replaceUnitById = async (req: express.Request, res: express.Response) => {
    log(await unitsService.replaceById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await unitsService.getTags();
    this.locales = await unitsService.getLocales();
  }

  removeUnitById = async (req: express.Request, res: express.Response) => {
    log(await unitsService.removeById(req.params.id));
    res.status(204).send();
    this.tags = await unitsService.getTags();
    this.locales = await unitsService.getLocales();
  }

  listUnitsByTagOrType = async (req: express.Request, res: express.Response) => {
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

    const units = await unitsService.listByNameOrType(tag, locales, filters, limit, page);
    res.status(200).send({units: units});
  }
}

export default new UnitsController()