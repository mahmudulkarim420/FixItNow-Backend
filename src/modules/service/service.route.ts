import express from "express";
import { ServiceControllers } from "./service.controller";
import { ServiceValidations } from "./service.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.get("/", ServiceControllers.getAllServices);
router.get("/categories", ServiceControllers.getAllCategories);
router.get("/technicians", ServiceControllers.getAllTechnicians);
router.get("/technicians/:id", ServiceControllers.getTechnicianById);
router.get("/:id", ServiceControllers.getServiceById);

router.post(
  "/",
  auth("TECHNICIAN"),
  validateRequest(ServiceValidations.createServiceValidationSchema),
  ServiceControllers.createService
);

router.patch(
  "/:id",
  auth("TECHNICIAN"),
  validateRequest(ServiceValidations.updateServiceValidationSchema),
  ServiceControllers.updateService
);

router.delete(
  "/:id",
  auth("TECHNICIAN"),
  ServiceControllers.deleteService
);

export const ServiceRoutes = router;
