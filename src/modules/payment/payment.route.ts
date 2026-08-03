import express from "express";
import { PaymentControllers } from "./payment.controller";
import { PaymentValidations } from "./payment.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema, paginationQuerySchema } from "../../validations";
import { auth } from "../../middlewares/auth";
import validateQuery from "../../middlewares/validateQuery";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Stripe Checkout integration and payment history
 */

/**
 * @swagger
 * /api/payments/checkout:
 *   post:
 *     summary: Create a Stripe Checkout Session
 *     description: |
 *       Creates a Stripe Hosted Checkout Session for an ACCEPTED booking.
 *       Returns the Checkout URL to redirect the customer to.
 *     tags: [Payment]
 *     security:
 *       - cookieAuth: []
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
 *                 description: ACCEPTED booking UUID
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Stripe Checkout session created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Checkout session created successfully!"
 *               data:
 *                 url: "https://checkout.stripe.com/c/pay/cs_test_..."
 *                 sessionId: "cs_test_..."
 *       400:
 *         description: Booking not in ACCEPTED state or already paid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not booking owner)
 *       404:
 *         description: Booking not found
 */
router.post(
  "/checkout",
  auth("CUSTOMER"),
  validateRequest(PaymentValidations.createCheckoutSessionValidationSchema),
  PaymentControllers.createCheckoutSession,
);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get user payment history
 *     description: Retrieve paginated payment history for the authenticated user (or all payments for Admin).
 *     tags: [Payment]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Payment history retrieved successfully!"
 *               data: []
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  auth("CUSTOMER", "ADMIN"),
  validateQuery(paginationQuerySchema),
  PaymentControllers.getUserPaymentHistory,
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment details by ID
 *     description: Retrieve details of a specific payment transaction.
 *     tags: [Payment]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment UUID
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Payment not found
 */
router.get(
  "/:id",
  auth("CUSTOMER", "ADMIN"),
  validateParams(idParamValidationSchema),
  PaymentControllers.getPaymentById,
);

export const PaymentRoutes = router;
