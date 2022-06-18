import express from 'express';
import languagesService from '../services/languages.service';
import {debug, IDebugger} from "debug"
import { availableFilters } from '../controllers/languages.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';

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
    } else {
      next();
    }
  }

  async validatePutBody(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    body('tag').isLocale();
    body('moduleType').isString();
    body('main').isObject();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  }

  async validatePatchBody(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    body('tag').isLocale();
    body('moduleType').isString();
    body('main').isObject();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  }

  async validateNameOrTypeParameter(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const tags = await languagesService.getTags();
    if(!tags.includes(req.params.tag)) {
      res.status(404).send();
    } else {
      next();
    }
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const language = await languagesService.getById(req.params.tag);
    if(!language) {
      res.status(404).send();
    } else {
      next();
    }
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || await languagesService.getLocales();
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const availableTags = await languagesService.getTags();

    const languages = await languagesService.list(availableTags, locales, filters, 1000, 1);

    let failed = false;
    languages.map(language => {
      if (
        language.main.tag === req.body.main.tag &&
        language.tag === req.body.tag
      ) {
        const id = language._id;
        failed = true
        res.status(409).send({ error: `Record exists. Use PUT to replace or PATCH to modify. ID: ${id}`});
      }
    });
    
    if (!failed) {
      next();
    }
  }
}

export default new LanguagesMiddleware();