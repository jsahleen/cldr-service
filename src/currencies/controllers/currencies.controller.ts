import express from 'express';
import CurrenciesService from '../services/currencies.service';
import debug, { IDebugger } from 'debug';
import availableLocales from 'cldr-core/availableLocales.json';
import rootCurrencies from 'cldr-numbers-modern/main/root/currencies.json';

const log: IDebugger = debug('app:currencies-controller');

const modernLocales = availableLocales.availableLocales.modern;
const availableCodes = Object.keys(rootCurrencies.main.root.numbers.currencies);

export const availableFilters: string[] = [
  'displayName',
  'plurals',
  'symbols',
  'fractions',
  'isCurrent',
  'territories'
];

class CurrenciesController {

  constructor() {
    log('Created new instance of CurrenciesController');
  }

  async listCurrencies(req: express.Request, res: express.Response) {
    let { 
      limit = 25, 
      page = 1,
      codes = availableCodes,
      locales = modernLocales,
      filters = availableFilters
    } = req.query;

    if (typeof codes === 'string') {
      codes = codes.split(',');
    } else {
      codes = availableCodes as string[];
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

    const currencies = await CurrenciesService.list(codes, locales, filters, limit, page);
    res.status(200).send({currencies: currencies});
  }

  async createCurrency(req: express.Request, res: express.Response) {
    const id = await CurrenciesService.create(req.body);
    res.status(201).send({ _id: id});
  }

  async getCurrencyById(req: express.Request, res: express.Response) {
    const currency = await CurrenciesService.getById(req.params.id);
    if (!currency) {
      res.status(404).send();
    }
    res.status(200).send(currency);
  }

  async updateCurrencyById(req: express.Request, res: express.Response) {
    log(await CurrenciesService.updateById(req.params.id, req.body));
    res.status(204).send();
  }

  async removeCurrencyById(req: express.Request, res: express.Response) {
    log(await CurrenciesService.removeById(req.params.id));
    res.status(204).send();
  }

  async listCurrenciesByNameOrType(req: express.Request, res: express.Response) {
    const code = req.params.code;

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

    const currencies = await CurrenciesService.listByNameOrType(code, locales, filters, limit, page);
    res.status(200).send({currencies: currencies});
  }
}

export default new CurrenciesController()