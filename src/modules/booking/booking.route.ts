import express from "express";
import { BookingControllers } from "./booking.controller";
import { BookingValidations } from "./booking.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(BookingValidations.createBookingValidationSchema),
  BookingControllers.createBooking
);

router.get(
  "/",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  BookingControllers.getAllBookings
);

router.get(
  "/:id",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  BookingControllers.getBookingById
);

router.patch(
  "/:id/cancel",
  auth("CUSTOMER"),
  BookingControllers.cancelBooking
);

export const BookingRoutes = router;
