import express from "express";
import { ServiceControllers } from "./service.controller";
import { ServiceValidations } from "./service.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema } from "../../validations";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.get("/", ServiceControllers.getAllServices);
router.get("/categories", ServiceControllers.getAllCategories);
router.get("/technicians", ServiceControllers.getAllTechnicians);
router.get(
  "/technicians/:id",
  validateParams(idParamValidationSchema),
  ServiceControllers.getTechnicianById
);
router.get(
  "/:id",
  validateParams(idParamValidationSchema),
  ServiceControllers.getServiceById
);

router.post(
  "/",
  auth("TECHNICIAN"),
  validateRequest(ServiceValidations.createServiceValidationSchema),
  ServiceControllers.createService
);

router.patch(
  "/:id",
  auth("TECHNICIAN"),
  validateParams(idParamValidationSchema),
  validateRequest(ServiceValidations.updateServiceValidationSchema),
  ServiceControllers.updateService
);

router.delete(
  "/:id",
  auth("TECHNICIAN"),
  validateParams(idParamValidationSchema),
  ServiceControllers.deleteService
);

export const ServiceRoutes = router;
