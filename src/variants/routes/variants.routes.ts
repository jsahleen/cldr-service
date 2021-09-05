import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import variantsController from "../controllers/variants.controller";
import variantsMiddleware from "../middleware/variants.middleware";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class VariantsRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'VariantsRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/variants')
      .get(variantsController.listVariants)

    this.app.route('/public/variants/:tag')
      .get([
        variantsMiddleware.validateNameOrTypeParameter,
        variantsController.listVariantsByTagOrType
      ]);

    this.app.route('/admin/variants')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(variantsController.listVariants)
      .post([
        variantsMiddleware.validatePostBody,
        variantsMiddleware.ensureDocumentDoesNotExist,
        variantsController.createVariant
      ]);

    this.app.route('/admin/variants/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        variantsMiddleware.ensureDocumentExists
      ])
      .get(variantsController.getVariantById)
      .put([
        variantsMiddleware.validatePutBody,
        variantsController.updateVariantById
      ])
      .patch([
        variantsMiddleware.validatePatchBody,
        variantsController.updateVariantById
      ])
      .delete(variantsController.removeVariantById)

    return this.app
  }
}
