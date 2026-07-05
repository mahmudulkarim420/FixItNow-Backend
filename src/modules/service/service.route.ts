import express from "express";
import { ServiceControllers } from "./service.controller";

const router = express.Router();

router.get("/", ServiceControllers.getAllServices);
router.get("/technicians", ServiceControllers.getAllTechnicians);
router.get("/technicians/:id", ServiceControllers.getTechnicianById);

export const ServiceRoutes = router;