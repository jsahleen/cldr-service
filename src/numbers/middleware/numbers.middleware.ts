import express from 'express';
import numbersService from '../services/numbers.service';
import {debug, IDebugger} from "debug"
import { availableFilters } from '../controllers/numbers.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';

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
    const systems = await numbersService.getTags();
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
    const locales = localeString?.split(',') || await numbersService.getLocales();
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const availableSystems = await numbersService.getTags();
    const numberSystems = await numbersService.list(availableSystems, locales, filters, 1000, 1);

    numberSystems.map(system => {
      if (
        system.main.name === req.body.main.name &&
        system.tag === req.body.tag
      ) {
        const id = system._id;
        res.status(409).send({ error: `Record exists. Use PUT to replace or PATCH to modify. ID: ${id}.`});
      }
    });
    
    next();
  }
}

export default new NumberSystemsMiddleware();