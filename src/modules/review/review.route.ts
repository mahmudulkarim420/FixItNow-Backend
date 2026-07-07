import express from "express";
import { ReviewControllers } from "./review.controller";
import { ReviewValidations } from "./review.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Review operations
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - technicianId
 *               - rating
 *             properties:
 *               serviceId:
 *                 type: string
 *               technicianId:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 */
router.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(ReviewValidations.createReviewValidationSchema),
  ReviewControllers.createReview,
);

export const ReviewRoutes = router;
