import express from 'express';
import CurrenciesService from '../services/currencies.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:currencies-controller');

export const availableFilters: string[] = [
  'displayName',
  'plurals',
  'symbols',
  'fractions',
  'isCurrent',
  'territories'
];

class CurrenciesController {

  tags: string[] = [];

  locales: string[] = [];

  constructor() {
    log('Created new instance of CurrenciesController');
    this.getTags();
    this.getLocales();
  }

  async getTags(): Promise<string[]> {
    if (Array.isArray(this.tags) && this.tags.length === 0) {
      this.tags = await CurrenciesService.getTags();
    }
    return this.tags;
  }

  async getLocales(): Promise<string[]> {
    if (Array.isArray(this.locales) && this.locales.length === 0) {
      this.locales = await CurrenciesService.getLocales();
    }
    return this.locales;
  }

  listCurrencies = async (req: express.Request, res: express.Response) => {
    let { 
      limit = 25, 
      page = 1,
      codes,
      locales,
      filters
    } = req.query;

    if (typeof codes === 'string') {
      codes = codes.split(',');
    } else {
      codes = await this.getTags();
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

    const currencies = await CurrenciesService.list(codes, locales, filters, limit, page);
    res.status(200).send({currencies: currencies});
  }

  async createCurrency(req: express.Request, res: express.Response) {
    const id = await CurrenciesService.create(req.body);
    res.status(201).send({ _id: id});
    this.tags = await CurrenciesService.getTags();
    this.locales = await CurrenciesService.getLocales();
  }

  async getCurrencyById(req: express.Request, res: express.Response) {
    const currency = await CurrenciesService.getById(req.params.id);
    if (!currency) {
      res.status(404).send();
    }
    res.status(200).send(currency);
  }

  async replaceCurrencyById(req: express.Request, res: express.Response) {
    log(await CurrenciesService.replaceById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await CurrenciesService.getTags();
    this.locales = await CurrenciesService.getLocales();
  }

  async updateCurrencyById(req: express.Request, res: express.Response) {
    log(await CurrenciesService.updateById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await CurrenciesService.getTags();
    this.locales = await CurrenciesService.getLocales();
  }

  async removeCurrencyById(req: express.Request, res: express.Response) {
    log(await CurrenciesService.removeById(req.params.id));
    res.status(204).send();
    this.tags = await CurrenciesService.getTags();
    this.locales = await CurrenciesService.getLocales();
  }

  listCurrenciesByNameOrType = async (req: express.Request, res: express.Response) => {
    const code = req.params.code;

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

    const currencies = await CurrenciesService.listByNameOrType(code, locales, filters, limit, page);
    res.status(200).send({currencies: currencies});
  }
}

export default new CurrenciesController()