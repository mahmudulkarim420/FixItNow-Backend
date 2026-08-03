import express from "express";
import { BookingControllers } from "./booking.controller";
import { BookingValidations } from "./booking.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema, paginationQuerySchema } from "../../validations";
import { auth } from "../../middlewares/auth";
import validateQuery from "../../middlewares/validateQuery";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Service booking creation, retrieval, and cancellation
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a service booking
 *     description: Customers can create a booking for a specific service, scheduled date, and time slot.
 *     tags: [Booking]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - scheduledDate
 *               - timeSlot
 *               - contactNumber
 *             properties:
 *               serviceId:
 *                 type: string
 *                 description: Valid Service UUID
 *                 example: "s123"
 *               scheduledDate:
 *                 type: string
 *                 description: Date string (YYYY-MM-DD)
 *                 example: "2026-08-15"
 *               timeSlot:
 *                 type: string
 *                 example: "10:00-12:00"
 *               contactNumber:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 201
 *               message: "Booking created successfully!"
 *               data:
 *                 id: "b123"
 *                 status: "PENDING"
 *                 scheduledDate: "2026-08-15"
 *                 timeSlot: "10:00-12:00"
 *       400:
 *         description: Validation error or slot unavailable
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Customers only)
 */
router.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(BookingValidations.createBookingValidationSchema),
  BookingControllers.createBooking,
);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     description: Retrieve bookings for the authenticated user (Filtered by user role - Customer, Technician, or Admin).
 *     tags: [Booking]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field name to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Bookings retrieved successfully!"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 3
 *                 totalPage: 1
 *               data: []
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  validateQuery(paginationQuerySchema),
  BookingControllers.getAllBookings,
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking details by ID
 *     description: Retrieve detailed information for a specific booking.
 *     tags: [Booking]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking UUID
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not booking owner or assigned technician)
 *       404:
 *         description: Booking not found
 */
router.get(
  "/:id",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  validateParams(idParamValidationSchema),
  BookingControllers.getBookingById,
);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     description: |
 *       Cancels a booking owned by the authenticated customer.
 *       Only the customer who created the booking may cancel it.
 *
 *       Business rules by booking/payment state:
 *       - ACCEPTED + payment PENDING: cancelled, no refund, payment stays PENDING.
 *       - PAID + payment COMPLETED: a Stripe refund is issued using the saved
 *         transactionId, booking becomes CANCELLED and payment becomes REFUNDED.
 *       - IN_PROGRESS: cannot be cancelled (400).
 *       - COMPLETED: cannot be cancelled (400).
 *       - CANCELLED: already cancelled (400).
 *     tags: [Booking]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking to cancel.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation (stored on the booking).
 *           examples:
 *             cancelAccepted:
 *               summary: Cancel an ACCEPTED booking (no refund)
 *               value:
 *                 reason: "Booked by mistake"
 *             cancelPaid:
 *               summary: Cancel a PAID booking (triggers refund)
 *               value:
 *                 reason: "No longer needed"
 *     responses:
 *       200:
 *         description: Booking cancelled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Booking cancelled successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: CANCELLED
 *                     cancellationReason:
 *                       type: string
 *                       example: "Booked by mistake"
 *                     payment:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: REFUNDED
 *       400:
 *         description: Booking cannot be cancelled.
 *       401:
 *         description: Not authenticated.
 *       403:
 *         description: Authenticated user is not the booking owner.
 *       404:
 *         description: Booking not found.
 */
router.patch(
  "/:id/cancel",
  auth("CUSTOMER"),
  validateParams(idParamValidationSchema),
  validateRequest(BookingValidations.cancelBookingValidationSchema),
  BookingControllers.cancelBooking,
);

export const BookingRoutes = router;
