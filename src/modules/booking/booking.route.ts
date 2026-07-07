import express from "express";
import { BookingControllers } from "./booking.controller";
import { BookingValidations } from "./booking.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema } from "../../validations";
import { auth } from "../../middlewares/auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Booking operations
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Booking]
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
 *               - serviceId
 *               - technicianProfileId
 *               - scheduledDate
 *               - timeSlot
 *               - contactNumber
 *             properties:
 *               serviceId:
 *                 type: string
 *               technicianProfileId:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *               timeSlot:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(BookingValidations.createBookingValidationSchema),
  BookingControllers.createBooking
);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Booking]
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
 *         description: List of bookings
 */
router.get(
  "/",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  BookingControllers.getAllBookings
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Booking]
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
 *         description: Booking details
 */
router.get(
  "/:id",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  validateParams(idParamValidationSchema),
  BookingControllers.getBookingById
);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Booking]
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
 *         description: Booking cancelled
 */
router.patch(
  "/:id/cancel",
  auth("CUSTOMER"),
  validateParams(idParamValidationSchema),
  BookingControllers.cancelBooking
);

export const BookingRoutes = router;
