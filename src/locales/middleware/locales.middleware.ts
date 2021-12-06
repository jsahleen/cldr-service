import express from 'express';
import {debug, IDebugger} from "debug"
import localesService from '../services/locales.service';
import { availableFilters } from '../controllers/locales.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';
import CLDRUTIL from '../../common/util/common.util';

const availableLocales = CLDRUTIL.getAvailableLocales();
const availableTags = availableLocales.filter(tag => tag !== CLDRUTIL.rootLocale);

const log: IDebugger = debug('app:locales-middleware');

class LocalesMiddleware implements IModuleMiddleware {
  constructor() {
    log('Created instance of LocalesMiddleware');
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
    const tags = await localesService.getLocaleTags();
    if(!tags.includes(req.params.tag)) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const script = await localesService.getById(req.params.tag);
    if(!script) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const tagsString = req.query.tags as string | undefined;
    const localeString = req.query.locales as string | undefined;
    const tags = tagsString?.split(',') || availableTags;
    const locales = localeString?.split(',') || availableLocales;
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const scripts = await localesService.list(tags, locales, filters, 1000, 1);

    scripts.map(script => {
      if (
        script.main.tag === req.body.main.tag &&
        script.identity === req.body.identity
      ) {
        res.status(409).send({ error: 'Record exists.'});
      }
    });
    
    next();
  }
}

export default new LocalesMiddleware();