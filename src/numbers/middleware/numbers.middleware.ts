import express from 'express';
import numbersService from '../services/numbers.service';
import {debug, IDebugger} from "debug"
import availableLocales from 'cldr-core/availableLocales.json';
import { availableFilters } from '../controllers/numbers.controller';

const modernLocales = availableLocales.availableLocales.modern;


const log: IDebugger = debug('app:users-controller');
class NumberSystemsMiddleware {
  constructor() {
    log('Created instance of NumberSystemsMiddleware');
  }

  async ensureNumberSystemExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const systems = await numbersService.getNumberSystemNames();
    if(
      !systems.includes(req.params.system) &&
      (req.params.system !== 'default' && req.params.system !== 'native')
    ) {
      res.status(404).send({ error: 'Record not found.'});
    }
    next();
  }

  async ensureSameSystemAndLocaleDoNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || modernLocales;
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const numberSystems = await numbersService.list(locales, filters, 1000, 1);

    numberSystems.map(system => {
      if (
        system.main.name === req.body.main.name &&
        system.tag === req.body.tag
      ) {
        res.status(409).send({ error: 'Record exists. Use put or patch to modify'});
      }
    });
    
    next();
  }
}

export default new NumberSystemsMiddleware();