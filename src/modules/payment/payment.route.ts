import express from "express";
import { PaymentControllers } from "./payment.controller";
import { PaymentValidations } from "./payment.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema } from "../../validations";
import { auth } from "../../middlewares/auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment operations via Stripe
 */

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     summary: Create a payment intent
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: cookie
 *         name: accessToken
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Payment intent created
 */
router.post(
  "/create",
  auth("CUSTOMER"),
  validateRequest(PaymentValidations.createPaymentIntentValidationSchema),
  PaymentControllers.createPaymentIntent
);

/**
 * @swagger
 * /api/payments/confirm:
 *   post:
 *     summary: Confirm a payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: cookie
 *         name: accessToken
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - transactionId
 *             properties:
 *               bookingId:
 *                 type: string
 *               transactionId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment confirmed
 */
router.post(
  "/confirm",
  auth("CUSTOMER"),
  validateRequest(PaymentValidations.confirmPaymentValidationSchema),
  PaymentControllers.confirmPayment
);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get payment history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: cookie
 *         name: accessToken
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Payment history retrieved
 */
router.get(
  "/",
  auth("CUSTOMER", "ADMIN"),
  PaymentControllers.getUserPaymentHistory
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: cookie
 *         name: accessToken
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Payment details
 */
router.get(
  "/:id",
  auth("CUSTOMER", "ADMIN"),
  validateParams(idParamValidationSchema),
  PaymentControllers.getPaymentById
);

export const PaymentRoutes = router;
