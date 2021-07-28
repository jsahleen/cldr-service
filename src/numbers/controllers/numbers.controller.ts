import express from 'express';
import NumberSystemsService from '../services/numbers.service';
import debug, { IDebugger } from 'debug';
import availableLocales from 'cldr-core/availableLocales.json';

const log: IDebugger = debug('app:numbersystem-controller');

const modernLocales = availableLocales.availableLocales.modern;

export const availableFilters: string[] = [
  'name',
  'digits',
  'minimumFractionDigits',
  'displayName',
  'patterns',
  'symbols',
  'isDefault',
  'isNative'
];

class NumberSystemController {

  constructor() {
    log('Created new instance of NumberSystemsController');
  }

  async listNumberSystems(req: express.Request, res: express.Response) {

    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || modernLocales;

    const filtersString = req.query.locales as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const limitString = req.query.limit as string | undefined;
    let limit = limitString && parseInt(limitString, 10) || 25;

    const pageString = req.query.page as string | undefined;
    let page = pageString && parseInt(pageString, 10) || 1;


    if (isNaN(limit)) {
      limit = 25;
    }

    if (isNaN(page)) {
      page = 1;
    }

    const numberSystems = await NumberSystemsService.list(locales, filters, limit, page);
    res.status(200).send({systems: numberSystems});
  }

  async createNumberSystem(req: express.Request, res: express.Response) {
    const id = await NumberSystemsService.create(req.body);
    res.status(201).send({ id: id});
  }

  async getNumberSystemById(req: express.Request, res: express.Response) {
    const numberSystem = await NumberSystemsService.getById(req.params.id);
    res.status(200).send(numberSystem);
  }

  async updateNumberSystemById(req: express.Request, res: express.Response) {
    log(await NumberSystemsService.updateById(req.body.id, req.body));
    res.status(204).send();
  }

  async replaceNumberSystemById(req: express.Request, res: express.Response) {
    log(await NumberSystemsService.replaceById(req.body.id, req.body));
    res.status(204).send();
  }

  async removeNumberSystemById(req: express.Request, res: express.Response) {
    log(await NumberSystemsService.removeById(req.body.id));
    res.status(204).send();
  }

  async listNumberSystemsByCategory(req: express.Request, res: express.Response) {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || modernLocales;

    const filtersString = req.query.locales as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const limitString = req.query.limit as string | undefined;
    let limit =  limitString && parseInt(limitString, 10) || 25;

    const pageString = req.query.page as string | undefined;
    let page =  pageString && parseInt(pageString, 10) || 1;

    const category = req.params.category;

    if (isNaN(limit)) {
      limit = 25;
    }

    if (isNaN(page)) {
      page = 1;
    }
    const results = await NumberSystemsService.listByCategory(category, locales, filters, limit, page);
    res.status(200).send(results);
  }
  async getNumberSystemByCategoryAndLocale(req: express.Request, res: express.Response) {
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;
    const record = await NumberSystemsService.getByCategoryAndLocale(req.params.category, req.params.locale, filters);
    res.status(200).send(record);
  }
}

export default new NumberSystemController()