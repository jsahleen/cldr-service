import express from 'express';
import languagesService from '../services/languages.service';
import debug, { IDebugger } from 'debug';
import availableLocales from 'cldr-core/availableLocales.json';

const log: IDebugger = debug('app:currencies-controller');

const modernLocales = availableLocales.availableLocales.modern;

export const availableFilters: string[] = [
  'displayName',
  'languageFamily',
  'pluralRules',
  'pluralRanges',
  'scripts',
  'territories'
];

class LanguagesController {

  constructor() {
    log('Created new instance of LanguagesController');
  }

  async listLanguages(req: express.Request, res: express.Response) {
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

    const languages = await languagesService.list(locales, filters, limit, page);
    res.status(200).send({languages: languages});
  }

  async createLanguage(req: express.Request, res: express.Response) {
    const id = await languagesService.create(req.body);
    res.status(201).send({ _id: id});
  }

  async getLanguageById(req: express.Request, res: express.Response) {
    const language = await languagesService.getById(req.params.id);
    if (!language) {
      res.status(404).send();
    }
    res.status(200).send(language);
  }

  async updateLanguageById(req: express.Request, res: express.Response) {
    log(await languagesService.updateById(req.params.id, req.body));
    res.status(204).send();
  }

  async removeLanguageById(req: express.Request, res: express.Response) {
    log(await languagesService.removeById(req.params.id));
    res.status(204).send();
  }

  async listLanguagesByTagOrType(req: express.Request, res: express.Response) {
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

    const languages = await languagesService.listByNameOrType(code, locales, filters, limit, page);
    res.status(200).send({languages: languages});
  }
}

export default new LanguagesController()