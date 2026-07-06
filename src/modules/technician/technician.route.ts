import express from "express";
import { TechnicianControllers } from "./technician.controller";
import { TechnicianValidations } from "./technician.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema } from "../../validations";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/bookings",
  auth("TECHNICIAN"),
  TechnicianControllers.getTechnicianBookings
);

router.patch(
  "/bookings/:id",
  auth("TECHNICIAN"),
  validateParams(idParamValidationSchema),
  validateRequest(TechnicianValidations.updateBookingStatusValidationSchema),
  TechnicianControllers.updateBookingStatus
);

router.put(
  "/profile",
  auth("TECHNICIAN"),
  validateRequest(TechnicianValidations.updateProfileValidationSchema),
  TechnicianControllers.updateProfile
);

router.put(
  "/availability",
  auth("TECHNICIAN"),
  validateRequest(TechnicianValidations.updateAvailabilityValidationSchema),
  TechnicianControllers.updateAvailability
);

const listingRouter = express.Router();

listingRouter.get("/", TechnicianControllers.getAllTechnicians);
listingRouter.get(
  "/:id",
  validateParams(idParamValidationSchema),
  TechnicianControllers.getTechnicianById
);

export const TechnicianRoutes = router;
export const TechnicianListingRoutes = listingRouter;
