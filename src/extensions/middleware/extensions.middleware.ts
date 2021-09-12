import express from 'express';
import {debug, IDebugger} from "debug"
import extensionsService from '../services/extensions.service';
import availableLocales from 'cldr-core/availableLocales.json';
import { availableFilters } from '../controllers/extensions.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';
import rootData from 'cldr-localenames-modern/main/root/localeDisplayNames.json';

const modernLocales = availableLocales.availableLocales.modern;
const availableKeys = Object.keys(rootData.main.root.localeDisplayNames.keys);

const log: IDebugger = debug('app:extensions-middleware');

class ExtensionsMiddleware implements IModuleMiddleware {
  constructor() {
    log('Created instance of ExtensionsMiddleware');
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
    const keys = await extensionsService.getExtensionKeys();
    if(!keys.includes(req.params.key)) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const extension = await extensionsService.getById(req.params.key);
    if(!extension) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || modernLocales;
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const extensions = await extensionsService.list(availableKeys, locales, filters, 1000, 1);

    extensions.map(extension => {
      if (
        extension.main.key === req.body.main.tag &&
        extension.identity === req.body.identity
      ) {
        res.status(409).send({ error: 'Record exists.'});
      }
    });
    
    next();
  }
}

export default new ExtensionsMiddleware();