import express from 'express';
import territoriesService from '../services/territories.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:territories-controller');

export const availableFilters: string[] = [
  'tag',
  'displayName',
  'altDisplayNames',
  'languages',
  'gdp',
  'population',
  'literacyPercent',
  'parentTerritories',
  'contains',
  'languages',
  'currencies'
];

class TerritoriesController {

  tags: string[] = [];

  locales: string[] = [];

  constructor() {
    log('Created new instance of TerritoriesController');
    this.getTags();
    this.getLocales();
  }

  private async getTags(): Promise<string[]> {
    if (Array.isArray(this.tags) && this.tags.length === 0) {
      this.tags = await territoriesService.getTags();
    }
    return this.tags;
  }

  private async getLocales(): Promise<string[]> {
    if (Array.isArray(this.locales) && this.locales.length === 0) {
      this.locales = await territoriesService.getLocales();
    }
    return this.locales;
  }

  listTerritories = async (req: express.Request, res: express.Response) => {
    let { 
      limit = 25, 
      page = 1,
      tags,
      locales,
      filters = availableFilters
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

    const territories = await territoriesService.list(tags, locales, filters, limit, page);
    res.status(200).send({territories: territories});
  }

  createTerritory = async (req: express.Request, res: express.Response) => {
    const id = await territoriesService.create(req.body);
    res.status(201).send({ _id: id});
    this.tags = await territoriesService.getTags();
    this.locales = await territoriesService.getLocales();
  }

  getTerritoryById = async (req: express.Request, res: express.Response) => {
    const territory = await territoriesService.getById(req.params.id);
    if (!territory) {
      res.status(404).send();
    }
    res.status(200).send(territory);
  }

  updateTerritoryById = async (req: express.Request, res: express.Response) => {
    log(await territoriesService.updateById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await territoriesService.getTags();
    this.locales = await territoriesService.getLocales();
  }

  replaceTerritoryById = async (req: express.Request, res: express.Response) => {
    log(await territoriesService.replaceById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await territoriesService.getTags();
    this.locales = await territoriesService.getLocales();
  }

  removeTerritoryById = async (req: express.Request, res: express.Response) => {
    log(await territoriesService.removeById(req.params.id));
    res.status(204).send();
    this.tags = await territoriesService.getTags();
    this.locales = await territoriesService.getLocales();
  }

  listTerritoriesByTagOrType = async (req: express.Request, res: express.Response) => {
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

    const territories = await territoriesService.listByNameOrType(tag, locales, filters, limit, page);
    res.status(200).send({territories: territories});
  }
}

export default new TerritoriesController()