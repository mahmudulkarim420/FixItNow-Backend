import express from "express";
import { TechnicianControllers } from "./technician.controller";
import { TechnicianValidations } from "./technician.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema } from "../../validations";
import { auth } from "../../middlewares/auth";

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
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/bookings", auth("TECHNICIAN"), TechnicianControllers.getTechnicianBookings);

/**
 * @swagger
 * /api/technician/bookings/{id}:
 *   patch:
 *     summary: Update booking status
 *     tags: [Technician]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               status:
 *                 type: string
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
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: number
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
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAvailable:
 *                 type: boolean
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
 *     responses:
 *       200:
 *         description: List of technicians
 */
listingRouter.get("/", TechnicianControllers.getAllTechnicians);
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
