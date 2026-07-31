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
 * /api/reviews/top:
 *   get:
 *     summary: Get top-rated public reviews
 *     tags: [Review]
 *     responses:
 *       200:
 *         description: List of top reviews
 */
router.get("/top", ReviewControllers.getTopReviews);

router.get(
  "/",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  ReviewControllers.getMyReviews
);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review
 *     tags: [Review]
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
 *               - rating
 *             properties:
 *               bookingId:
 *                 type: string
 *               rating:
 *                 type: integer
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
  ReviewControllers.createReview
);

export const ReviewRoutes = router;
