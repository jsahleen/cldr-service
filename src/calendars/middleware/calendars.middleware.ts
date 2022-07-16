import express from 'express';
import {debug, IDebugger} from "debug"
import { availableFilters } from '../controllers/calendars.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';
import calendarsService from '../services/calendars.service';

const log: IDebugger = debug('app:calendars-middleware');

class CalendarsMiddleware implements IModuleMiddleware {
  constructor() {
    log('Created instance of CalendarsMiddleware');
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
    const tags = await calendarsService.getTags();
    if(!tags.includes(req.params.calendar) && (req.params.calendar !== 'preferred')) {
      res.status(404).send();
    } else {
      next();
    }
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const calendar = await calendarsService.getById(req.params.id);
    if(!calendar) {
      res.status(404).send();
    } else {
      next();
    }
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || await calendarsService.getLocales();
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const availableCalendars = await calendarsService.getTags();

    const calendars = await calendarsService.list(availableCalendars, locales, filters, 1000, 1);

    let failed = false;
    calendars.map(calendar => {
      if (
        calendar && calendar.main.tag === req.body.main.tag &&
        calendar.tag === req.body.tag
      ) {
        const id = calendar._id?.toString();
        failed = true;
        res.status(409).send({ error: `Record exists. Use PUT to replace or PATCH to modify. ID: ${id}`});
      } 
    });
    if (!failed) {
      next();
    }
  }
}

export default new CalendarsMiddleware();