import express from 'express';
import {debug, IDebugger} from "debug"
import variantsService from '../services/variants.service';
import { availableFilters } from '../controllers/variants.controller';
import { IModuleMiddleware } from '../../common/interfaces/middleware.interface';
import { body, validationResult } from 'express-validator';

const log: IDebugger = debug('app:variants-middleware');

class VariantsMiddleware implements IModuleMiddleware {
  constructor() {
    log('Created instance of VariantsMiddleware');
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
    const tags = await variantsService.getTags();
    if(!tags.includes(req.params.tag)) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentExists(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const script = await variantsService.getById(req.params.tag);
    if(!script) {
      res.status(404).send();
    }
    next();
  }

  async ensureDocumentDoesNotExist(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const localeString = req.query.locales as string | undefined;
    const locales = localeString?.split(',') || await variantsService.getLocales();
    
    const filtersString = req.query.filters as string | undefined;
    const filters = filtersString?.split(',') || availableFilters;

    const availableTags = await variantsService.getTags();

    const variants = await variantsService.list(availableTags, locales, filters, 1000, 1);

    variants.map(variant => {
      if (
        variant.main.tag === req.body.main.tag &&
        variant.tag === req.body.tag
      ) {
        const id = variant._id;
        res.status(409).send({ error: `Record exists. Use PUT to replace or PATCH to modify. ID: ${id}`});
      }
    });
    
    next();
  }
}

export default new VariantsMiddleware();