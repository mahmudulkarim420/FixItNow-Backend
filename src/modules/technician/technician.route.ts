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
 *   description: Technician operations
 */

/**
 * @swagger
 * /api/technician/bookings:
 *   get:
 *     summary: Get technician's bookings
 *     tags: [Technician]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
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
 *     tags: [Technician]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Booking updated
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
 *               experience:
 *                 type: number
 *               hourlyRate:
 *                 type: number
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
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
 *     summary: Update availability
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
 *               availability:
 *                 type: object
 *     responses:
 *       200:
 *         description: Availability updated
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
 *     summary: Get all technicians
 *     tags: [Technician]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of technicians
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
 *     summary: Get technician by ID
 *     tags: [Technician]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Technician details
 */
listingRouter.get(
  "/:id",
  validateParams(idParamValidationSchema),
  TechnicianControllers.getTechnicianById,
);

export const TechnicianRoutes = router;
export const TechnicianListingRoutes = listingRouter;
