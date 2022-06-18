import express from 'express';
import relativeTimeService from '../services/time.service';
import {debug, IDebugger} from "debug"
import { availableFilters } from '../controllers/time.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';

const log: IDebugger = debug('app:time-middleware');

class RelativeTimeMiddleware implements IModuleMiddleware {
  constructor() {
    log('Created instance of RelativeTimeMiddleware');
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
    const formats = await relativeTimeService.getTags();
    if(
      !formats.includes(req.params.format)
    ) {
      res.status(404).send();
    } else {
      next();
    }
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const relativeTimeFormats = await relativeTimeService.getById(req.params.id);
    if(!relativeTimeFormats) {
      res.status(404).send();
    } else {
      next();
    }
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || await relativeTimeService.getLocales();
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const availableFormats = await relativeTimeService.getTags();

    const relativeTimeFormats = await relativeTimeService.list(availableFormats, locales, filters, 1000, 1);

    let failed = false;
    relativeTimeFormats.map(formats => {
      if (formats.tag === req.body.tag) {
        const id = formats._id;
        failed = true;
        res.status(409).send({ error: `Record exists. Use PUT to replace or PATCH to modify. ID: ${id}`});
      }
    });
    
    if (!failed) {
      next();
    }
  }
}

export default new RelativeTimeMiddleware();