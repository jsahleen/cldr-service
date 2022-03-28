import express from 'express';
import ZonesService from '../services/zones.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:zones-controller');

export const availableFilters: string[] = [
  'components',
  'exemplarCityName',
  'formats',
  'metaZones'
];

class ZonesController {

  tags: string[] = [];

  locales: string[] = [];

  constructor() {
    log('Created new instance of ZonesController');
    this.getTags();
    this.getLocales();
  }

  private async getTags(): Promise<string[]> {
    if (Array.isArray(this.tags) && this.tags.length === 0) {
      this.tags = await ZonesService.getTags();
    }
    return this.tags;
  }

  private async getLocales(): Promise<string[]> {
    if (Array.isArray(this.locales) && this.locales.length === 0) {
      this.locales = await ZonesService.getLocales();
    }
    return this.locales;
  }

  listZones = async (req: express.Request, res: express.Response) => {
    let { 
      limit = 25, 
      page = 1,
      zones,
      locales,
      filters
    } = req.query;

    if (typeof zones === 'string') {
      zones = zones.split(',');
    } else {
      zones = await this.getTags();
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

    const results = await ZonesService.list(zones, locales, filters, limit, page);
    res.status(200).send({zones: results});
  }

  createZone = async (req: express.Request, res: express.Response) => {
    const id = await ZonesService.create(req.body);
    res.status(201).send({ _id: id});
    this.tags = await ZonesService.getTags();
    this.locales = await ZonesService.getLocales();
  }

  getZoneById = async (req: express.Request, res: express.Response) => {
    const relativeTimeFormats = await ZonesService.getById(req.params.id);
    if (!relativeTimeFormats) {
      res.status(404).send();
    }
    res.status(200).send(relativeTimeFormats);
  }

  replaceZoneById = async (req: express.Request, res: express.Response) => {
    log(await ZonesService.replaceById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await ZonesService.getTags();
    this.locales = await ZonesService.getLocales();
  }

  updateZoneById = async (req: express.Request, res: express.Response) => {
    log(await ZonesService.updateById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await ZonesService.getTags();
    this.locales = await ZonesService.getLocales();
  }

  removeZoneById = async (req: express.Request, res: express.Response) => {
    log(await ZonesService.removeById(req.params.id));
    res.status(204).send();
    this.tags = await ZonesService.getTags();
    this.locales = await ZonesService.getLocales();
  }

  listZoneByIdentifier = async (req: express.Request, res: express.Response) => {
    const identifier = req.params.identifier;

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

    const zones = await ZonesService.listByNameOrType(identifier, locales, filters, limit, page);
    res.status(200).send({zones: zones});
  }
}

export default new ZonesController()