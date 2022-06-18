import express from 'express';
import {debug, IDebugger} from "debug"
import scriptsService from '../services/scripts.service';
import { availableFilters } from '../controllers/scripts.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';

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
    const tags = await scriptsService.getTags();
    if(!tags.includes(req.params.tag)) {
      res.status(404).send();
    } else {
      next();
    }
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const script = await scriptsService.getById(req.params.tag);
    if(!script) {
      res.status(404).send();
    } else {
      next();
    }
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || await scriptsService.getLocales();
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const availableTags = await scriptsService.getTags();

    const scripts = await scriptsService.list(availableTags, locales, filters, 1000, 1);

    let failed = false;
    scripts.map(script => {
      if (
        script.main.tag === req.body.main.tag &&
        script.tag === req.body.tag
      ) {
        const id = script._id;
        failed = true;
        res.status(409).send({ error: `Record exists. Use PUT to replace or PATCH to modify. ID: ${id}`});
      }
    });
    
    if (!failed) {
      next();
    }
  }
}

export default new ScriptsMiddleware();