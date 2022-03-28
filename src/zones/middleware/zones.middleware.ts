import express from 'express';
import zonesService from '../services/zones.service';
import {debug, IDebugger} from "debug"
import { availableFilters } from '../controllers/zones.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';

const log: IDebugger = debug('app:zones-middleware');

class ZonesMiddleware implements IModuleMiddleware {
  constructor() {
    log('Created instance of ZonesMiddleware');
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

  async parseIdentifier(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const { seg1, seg2, seg3 } = req.params;
    if (seg3) {
      req.params.identifier = [seg1, seg2, seg3].join('/');
    } else {
      req.params.identifier = [seg1, seg2].join('/');
    }
    next();
  }

  async validateNameOrTypeParameter(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const identifiers = await zonesService.getTags();

    if (identifiers.includes(req.params.identifier)) {
      next();
    } else {
      res.status(404).send();
    } 
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const zones = await zonesService.getById(req.params.id);
    if(!zones) {
      res.status(404).send();
    } else {
      next();
    }
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || await zonesService.getLocales();
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const availableZones = await zonesService.getTags();

    const zones = await zonesService.list(availableZones, locales, filters, 1000, 1);

    let failed = false;
    zones.map(zone => {
      if (zone.tag === req.body.tag && zone.main.identifier === req.body.main.identifier) {
        const id = zone._id;
        failed = true;
        res.status(409).send({ error: `Record exists. Use PUT to replace or PATCH to modify. ID: ${id}`});
      }
    });
    
    if (!failed) {
      next();
    }
  }
}

export default new ZonesMiddleware();