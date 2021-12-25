import express from 'express';
import {debug, IDebugger} from "debug"
import { availableFilters } from '../controllers/calendars.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';
import CLDRUTIL from '../../common/util/common.util';
import calendarsService from '../services/calendars.service';

const availableLocales = CLDRUTIL.getAvailableLocales();
const rootData = CLDRUTIL.getRootLocaleData('localenames', 'localeDisplayNames');
const availableCalendars = Object.keys(rootData.main[CLDRUTIL.rootLocale].localeDisplayNames.types.calendar);

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
    const tags = await calendarsService.getCalendarTags();
    if(!tags.includes(req.params.calendar) && (req.params.calendar !== 'preferred')) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const calendar = await calendarsService.getById(req.params.id);
    if(!calendar) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || availableLocales;
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const calendars = await calendarsService.list(availableCalendars, locales, filters, 1000, 1);

    calendars.map(calendar => {
      if (
        calendar.main.tag === req.body.main.tag &&
        calendar.identity === req.body.identity
      ) {
        res.status(409).send({ error: 'Record exists.'});
      }
    });
    
    next();
  }
}

export default new CalendarsMiddleware();