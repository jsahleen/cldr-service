import express from 'express';
import {debug, IDebugger} from "debug"
import scriptsService from '../services/scripts.service';
import availableLocales from 'cldr-core/availableLocales.json';
import { availableFilters } from '../controllers/scripts.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';

const modernLocales = availableLocales.availableLocales.modern;

const log: IDebugger = debug('app:scripts-middleware');

class ScriptsMiddleware implements IModuleMiddleware {
  constructor() {
    log('Created instance of ScriptsMiddleware');
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
    const tags = await scriptsService.getScriptTags();
    if(!tags.includes(req.params.tag)) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const script = await scriptsService.getById(req.params.tag);
    if(!script) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || modernLocales;
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const scripts = await scriptsService.list(locales, filters, 1000, 1);

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

export default new ScriptsMiddleware();