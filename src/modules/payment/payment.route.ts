import express from "express";
import { PaymentControllers } from "./payment.controller";
import { PaymentValidations } from "./payment.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/create",
  auth("CUSTOMER"),
  validateRequest(PaymentValidations.createPaymentIntentValidationSchema),
  PaymentControllers.createPaymentIntent
);

router.post(
  "/confirm",
  auth("CUSTOMER"),
  validateRequest(PaymentValidations.confirmPaymentValidationSchema),
  PaymentControllers.confirmPayment
);

router.get(
  "/",
  auth("CUSTOMER", "ADMIN"),
  PaymentControllers.getUserPaymentHistory
);

router.get(
  "/:id",
  auth("CUSTOMER", "ADMIN"),
  PaymentControllers.getPaymentById
);

export const PaymentRoutes = router;
