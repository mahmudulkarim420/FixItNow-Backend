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
 *   description: Customer reviews and ratings
 */

/**
 * @swagger
 * /api/reviews/top:
 *   get:
 *     summary: Get top-rated public reviews
 *     description: Retrieve highest rated public service reviews for display on homepage or landing page.
 *     tags: [Review]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Maximum number of top reviews to return
 *     responses:
 *       200:
 *         description: Top reviews retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Top reviews retrieved successfully!"
 *               data:
 *                 - id: "r123"
 *                   rating: 5
 *                   comment: "Excellent service!"
 *                   user:
 *                     name: "Alice"
 */
router.get("/top", ReviewControllers.getTopReviews);

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get user reviews
 *     description: Retrieve all reviews authored by or received by the current user.
 *     tags: [Review]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Reviews retrieved successfully!"
 *               data: []
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  ReviewControllers.getMyReviews
);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review for a completed service
 *     description: Customers can leave a review (rating 1-5 and comment) for a completed booking.
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
 *                 description: COMPLETED booking UUID
 *                 example: "b123"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Technician arrived on time and fixed the issue quickly!"
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 201
 *               message: "Review created successfully!"
 *               data:
 *                 id: "r123"
 *                 rating: 5
 *                 comment: "Technician arrived on time and fixed the issue quickly!"
 *       400:
 *         description: Validation error or booking not completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not booking owner)
 *       409:
 *         description: Review already exists for this booking
 */
router.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(ReviewValidations.createReviewValidationSchema),
  ReviewControllers.createReview
);

export const ReviewRoutes = router;
