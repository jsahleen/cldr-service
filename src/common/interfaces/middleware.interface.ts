import express from 'express'

export interface ICommonMiddleware {
  validatePostBody: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>
  validatePutBody: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>
  validatePatchBody: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>

  ensureDocumentDoesNotExist: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>
  ensureDocumentExists: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>
}

export interface IModuleMiddleware extends ICommonMiddleware {
  validateNameOrTypeParameter: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>
}
