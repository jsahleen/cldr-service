import express from 'express';
import languagesService from '../services/languages.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:languages-controller');

export const availableFilters: string[] = [
  'displayName',
  'languageFamily',
  'pluralRules',
  'pluralRanges',
  'scripts',
  'territories'
];

class LanguagesController {

  tags: string[] = [];

  locales: string[] = [];

  constructor() {
    log('Created new instance of LanguagesController');
    this.getTags();
    this.getLocales();
  }

  async getTags(): Promise<string[]> {
    if (Array.isArray(this.tags) && this.tags.length === 0) {
      this.tags = await languagesService.getTags();
    }
    return this.tags;
  }

  async getLocales(): Promise<string[]> {
    if (Array.isArray(this.locales) && this.locales.length === 0) {
      this.locales = await languagesService.getLocales();
    }
    return this.locales;
  }

  listLanguages = async (req: express.Request, res: express.Response) => {
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

    const languages = await languagesService.list(tags, locales, filters, limit, page);
    res.status(200).send({languages: languages});
  }

  async createLanguage(req: express.Request, res: express.Response) {
    const id = await languagesService.create(req.body);
    res.status(201).send({ _id: id});
    this.tags = await languagesService.getTags();
    this.locales = await languagesService.getLocales();
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
    this.tags = await languagesService.getTags();
    this.locales = await languagesService.getLocales();
  }

  async replaceLanguageById(req: express.Request, res: express.Response) {
    log(await languagesService.replaceById(req.params.id, req.body));
    res.status(204).send();
    this.tags = await languagesService.getTags();
    this.locales = await languagesService.getLocales();
  }

  async removeLanguageById(req: express.Request, res: express.Response) {
    log(await languagesService.removeById(req.params.id));
    res.status(204).send();
    this.tags = await languagesService.getTags();
    this.locales = await languagesService.getLocales();
  }

  listLanguagesByTagOrType = async (req: express.Request, res: express.Response) => {
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

    const languages = await languagesService.listByNameOrType(tag, locales, filters, limit, page);
    res.status(200).send({languages: languages});
  }
}

export default new LanguagesController()