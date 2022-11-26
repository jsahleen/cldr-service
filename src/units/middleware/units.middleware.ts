import express from 'express';
import {debug, IDebugger} from "debug"
import { availableFilters } from '../controllers/units.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';
import unitsService from '../services/units.service';

const log: IDebugger = debug('app:variants-middleware');

class UnitsMiddleware implements IModuleMiddleware {
  constructor() {
    log('Created instance of UnitsMiddleware');
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
    const tags = await unitsService.getTags();
    if(!tags.includes(req.params.tag)) {
      res.status(404).send();
    } else {
      next();
    }
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const unit = await unitsService.getById(req.params.tag);
    if(!unit) {
      res.status(404).send();
    } else {
      next();
    }
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || await unitsService.getLocales();
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const availableTags = await unitsService.getTags();

    const units = await unitsService.list(availableTags, locales, filters, 1000, 1);

    let failed = false;
    units.map(unit => {
      if (
        unit.main.tag === req.body.main.tag &&
        unit.tag === req.body.tag
      ) {
        const id =  unit._id?.toString();
        failed = true;
        res.status(409).send({ error: `Record exists. Use PUT to replace or PATCH to modify. ID: ${id}`});
      }
    });
    
    if (!failed) {
      next();
    }
  }
}

export default new UnitsMiddleware();