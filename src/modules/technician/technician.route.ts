import express from "express";
import { TechnicianControllers } from "./technician.controller";
import { TechnicianValidations } from "./technician.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema, paginationQuerySchema } from "../../validations";
import { auth } from "../../middlewares/auth";
import validateQuery from "../../middlewares/validateQuery";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Technician
 *   description: Technician self-service & public technician directory
 */

/**
 * @swagger
 * /api/technician/apply:
 *   post:
 *     summary: Submit application to become a technician
 *     description: Submit technician profile details for admin review. Available for CUSTOMER and TECHNICIAN roles.
 *     tags: [Technician]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bio
 *               - skills
 *               - experience
 *               - hourlyRate
 *               - location
 *             properties:
 *               bio:
 *                 type: string
 *                 example: "Certified plumber with 5 years experience"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Plumbing", "Pipe Fitting"]
 *               experience:
 *                 type: number
 *                 example: 5
 *               hourlyRate:
 *                 type: number
 *                 example: 45
 *               location:
 *                 type: string
 *                 example: "New York, NY"
 *               availability:
 *                 type: object
 *                 example:
 *                   monday: ["09:00-12:00", "14:00-18:00"]
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 201
 *               message: "Technician application submitted successfully!"
 *               data:
 *                 id: "app-123"
 *                 status: "PENDING"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/apply",
  auth("CUSTOMER", "TECHNICIAN"),
  validateRequest(TechnicianValidations.applyTechnicianValidationSchema),
  TechnicianControllers.applyForTechnician
);

/**
 * @swagger
 * /api/technician/application-status:
 *   get:
 *     summary: Check technician application status
 *     description: Get current user's submitted technician application status.
 *     tags: [Technician]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Application status retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Application status retrieved successfully!"
 *               data:
 *                 status: "PENDING"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No application found
 */
router.get(
  "/application-status",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  TechnicianControllers.getApplicationStatus
);

/**
 * @swagger
 * /api/technician/bookings:
 *   get:
 *     summary: Get technician's assigned bookings
 *     description: Retrieve all bookings assigned to the authenticated technician.
 *     tags: [Technician]
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
 *     responses:
 *       200:
 *         description: Technician bookings retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Technician bookings retrieved successfully!"
 *               data: []
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Technicians only)
 */
router.get(
  "/bookings",
  auth("TECHNICIAN"),
  validateQuery(paginationQuerySchema),
  TechnicianControllers.getTechnicianBookings,
);

/**
 * @swagger
 * /api/technician/bookings/{id}:
 *   patch:
 *     summary: Update booking status
 *     description: Change status of an assigned booking (ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED).
 *     tags: [Technician]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED]
 *                 example: ACCEPTED
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Booking status updated successfully!"
 *               data:
 *                 id: "b123"
 *                 status: "ACCEPTED"
 *       400:
 *         description: Invalid status transition or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.patch(
  "/bookings/:id",
  auth("TECHNICIAN"),
  validateParams(idParamValidationSchema),
  validateRequest(TechnicianValidations.updateBookingStatusValidationSchema),
  TechnicianControllers.updateBookingStatus,
);

/**
 * @swagger
 * /api/technician/profile:
 *   put:
 *     summary: Update technician profile
 *     description: Update bio, skills, experience, hourly rate, or location.
 *     tags: [Technician]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: "Master electrician with 10 years experience."
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Electrical Wiring", "Circuit Repair"]
 *               experience:
 *                 type: number
 *                 example: 10
 *               hourlyRate:
 *                 type: number
 *                 example: 65
 *               location:
 *                 type: string
 *                 example: "Brooklyn, NY"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/profile",
  auth("TECHNICIAN"),
  validateRequest(TechnicianValidations.updateProfileValidationSchema),
  TechnicianControllers.updateProfile,
);

/**
 * @swagger
 * /api/technician/availability:
 *   put:
 *     summary: Update weekly availability schedule
 *     description: Updates the technician's weekly availability slots.
 *     tags: [Technician]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - availability
 *             properties:
 *               availability:
 *                 type: object
 *                 additionalProperties:
 *                   type: array
 *                   items:
 *                     type: string
 *             example:
 *               availability:
 *                 monday: ["09:00-12:00", "14:00-18:00"]
 *                 tuesday: ["09:00-12:00"]
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/availability",
  auth("TECHNICIAN"),
  validateRequest(TechnicianValidations.updateAvailabilityValidationSchema),
  TechnicianControllers.updateAvailability,
);

const listingRouter = express.Router();

/**
 * @swagger
 * /api/services/technicians:
 *   get:
 *     summary: Get public list of technicians
 *     description: Retrieve a paginated list of active technicians.
 *     tags: [Technician]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or skill
 *     responses:
 *       200:
 *         description: List of technicians retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Technicians retrieved successfully!"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 5
 *                 totalPage: 1
 *               data: []
 */
listingRouter.get(
  "/",
  validateQuery(paginationQuerySchema),
  TechnicianControllers.getAllTechnicians,
);

/**
 * @swagger
 * /api/services/technicians/{id}:
 *   get:
 *     summary: Get public technician profile by ID
 *     description: Retrieve detailed public profile of a technician by ID.
 *     tags: [Technician]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Technician profile UUID
 *     responses:
 *       200:
 *         description: Technician details retrieved successfully
 *       404:
 *         description: Technician not found
 */
listingRouter.get(
  "/:id",
  validateParams(idParamValidationSchema),
  TechnicianControllers.getTechnicianById,
);

export const TechnicianRoutes = router;
export const TechnicianListingRoutes = listingRouter;
