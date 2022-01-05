import express from 'express';
import currenciesService from '../services/currencies.service';
import {debug, IDebugger} from "debug"
import { availableFilters } from '../controllers/currencies.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';
import CLDRUTIL from '../../common/util/common.util';

const availableLocales = CLDRUTIL.getAvailableLocales();
const rootData = CLDRUTIL.getRootLocaleData('numbers', 'currencies');
const availableCodes = Object.keys(rootData.main[CLDRUTIL.rootLocale].numbers.currencies);

const log: IDebugger = debug('app:currencies-middleware');

class CurrenciesMiddleware implements IModuleMiddleware {
  constructor() {
    log('Created instance of NumberSystemsMiddleware');
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
    const codes = await currenciesService.getTags();
    if(
      !codes.includes(req.params.code) &&
      (req.params.code !== 'current' && req.params.code !== 'historical')
    ) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const currency = await currenciesService.getById(req.params.id);
    if(!currency) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || availableLocales;
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const currencies = await currenciesService.list(availableCodes, locales, filters, 1000, 1);

    currencies.map(currency => {
      if (
        currency.main.code === req.body.main.code &&
        currency.identity === req.body.identity
      ) {
        res.status(409).send({ error: 'Record exists.'});
      }
    });
    
    next();
  }
}

export default new CurrenciesMiddleware();