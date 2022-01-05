import express from 'express';
import variantsService from '../services/variants.service';
import debug, { IDebugger } from 'debug';

const log: IDebugger = debug('app:variants-controller');

export const availableFilters: string[] = [
  'tag',
  'displayName'
];

class VariantsController {

  constructor() {
    log('Created new instance of VariantsController');
  }

  async listVariants(req: express.Request, res: express.Response) {
    let { 
      limit = 25, 
      page = 1,
      tags,
      locales,
      filters
    } = req.query;

    if (typeof tags === 'string') {
      tags = tags.split(',');
    } else {
      tags = await variantsService.getTags();
    }

    if (typeof locales === 'string') {
      locales = locales.split(',');
    } else {
      locales = await variantsService.getLocales();
    }

    if (typeof filters === 'string') {
      filters = filters.split(',');
    } else {
      filters = availableFilters as string[];
    }
    
    limit = parseInt(limit as string, 10);
    page = parseInt(page as string, 10);

    if (isNaN(limit) || isNaN(page)) {
      res.status(400).send();
    }

    const variants = await variantsService.list(tags, locales, filters, limit, page);
    res.status(200).send({variants: variants});
  }

  async createVariant(req: express.Request, res: express.Response) {
    const id = await variantsService.create(req.body);
    res.status(201).send({ _id: id});
  }

  async getVariantById(req: express.Request, res: express.Response) {
    const variant = await variantsService.getById(req.params.id);
    if (!variant) {
      res.status(404).send();
    }
    res.status(200).send(variant);
  }

  async updateVariantById(req: express.Request, res: express.Response) {
    log(await variantsService.updateById(req.params.id, req.body));
    res.status(204).send();
  }

  async replaceVariantById(req: express.Request, res: express.Response) {
    log(await variantsService.replaceById(req.params.id, req.body));
    res.status(204).send();
  }

  async removeVariantById(req: express.Request, res: express.Response) {
    log(await variantsService.removeById(req.params.id));
    res.status(204).send();
  }

  async listVariantsByTagOrType(req: express.Request, res: express.Response) {
    const tag = req.params.tag;

    let { 
      limit = 25, 
      page = 1,
      locales,
      filters
    } = req.query;

    if (typeof locales === 'string') {
      locales = locales.split(',');
    } else {
      locales = await variantsService.getLocales();
    }

    if (typeof filters === 'string') {
      filters = filters.split(',');
    } else {
      filters = availableFilters as string[];
    }
    
    limit = parseInt(limit as string, 10);
    page = parseInt(page as string, 10);

    if (isNaN(limit) || isNaN(page)) {
      res.status(400).send();
    }

    const variants = await variantsService.listByNameOrType(tag, locales, filters, limit, page);
    res.status(200).send({variants: variants});
  }
}

export default new VariantsController()