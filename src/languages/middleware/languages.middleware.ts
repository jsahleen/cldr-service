import express from 'express';
import languagesService from '../services/languages.service';
import {debug, IDebugger} from "debug"
import availableLocales from 'cldr-core/availableLocales.json';
import { availableFilters } from '../controllers/languages.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';
import rootData from 'cldr-localenames-modern/main/root/languages.json';

const modernLocales = availableLocales.availableLocales.modern;
const availableTags = Object.keys(rootData.main.root.localeDisplayNames.languages);

const log: IDebugger = debug('app:languages-middleware');

class LanguagesMiddleware implements IModuleMiddleware {
  constructor() {
    log('Created instance of LanguagesMiddleware');
  }

  async validatePostBody(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    body('tag').isLocale();
    body('moduleType').isString();
    body('main').isObject();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    next();
  }

  async validatePutBody(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    body('tag').isLocale();
    body('moduleType').isString();
    body('main').isObject();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    next();
  }

  async validatePatchBody(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    body('tag').isLocale();
    body('moduleType').isString();
    body('main').isObject();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    next();
  }

  async validateNameOrTypeParameter(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const tags = await languagesService.getLanguageTags();
    if(!tags.includes(req.params.tag)) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const language = await languagesService.getById(req.params.tag);
    if(!language) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || modernLocales;
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const languages = await languagesService.list(availableTags, locales, filters, 1000, 1);

    languages.map(language => {
      if (
        language.main.tag === req.body.main.tag &&
        language.identity === req.body.identity
      ) {
        res.status(409).send({ error: 'Record exists.'});
      }
    });
    
    next();
  }
}

export default new LanguagesMiddleware();