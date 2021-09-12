import express from 'express';
import numbersService from '../services/numbers.service';
import {debug, IDebugger} from "debug"
import availableLocales from 'cldr-core/availableLocales.json';
import { availableFilters } from '../controllers/numbers.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';
import rootData from 'cldr-localenames-modern/main/root/localeDisplayNames.json';

const modernLocales = availableLocales.availableLocales.modern;
const availableSystems = Object.keys(rootData.main.root.localeDisplayNames.types.numbers)

const log: IDebugger = debug('app:users-controller');

class NumberSystemsMiddleware implements IModuleMiddleware {
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
    const systems = await numbersService.getNumberSystemNames();
    if(
      !systems.includes(req.params.system) &&
      (req.params.system !== 'default' && req.params.system !== 'native')
    ) {
      res.status(404).send({ error: 'Not found.'});
    }
    next();
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const system = await numbersService.getById(req.params.id);
    if(!system) {
      res.status(404).send({ error: 'Not found.'});
    }
    next();
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || modernLocales;
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const numberSystems = await numbersService.list(availableSystems, locales, filters, 1000, 1);

    numberSystems.map(system => {
      if (
        system.main.name === req.body.main.name &&
        system.identity === req.body.identity
      ) {
        res.status(409).send({ error: 'Record exists. Use put or patch to modify'});
      }
    });
    
    next();
  }
}

export default new NumberSystemsMiddleware();