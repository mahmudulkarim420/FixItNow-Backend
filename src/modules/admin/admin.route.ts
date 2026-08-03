import express from "express";
import { AdminControllers } from "./admin.controller";
import { AdminValidations } from "./admin.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema, paginationQuerySchema } from "../../validations";
import { auth } from "../../middlewares/auth";
import validateQuery from "../../middlewares/validateQuery";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative management operations
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all registered users
 *     description: Retrieve a paginated list of all users. Requires Admin role.
 *     tags: [Admin]
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
 *         description: Number of items per page
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for user name or email
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Users retrieved successfully!"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 25
 *                 totalPage: 3
 *               data:
 *                 - id: "u123"
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *                   role: "CUSTOMER"
 *                   status: "ACTIVE"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get(
  "/users",
  auth("ADMIN"),
  validateQuery(paginationQuerySchema),
  AdminControllers.getAllUsers,
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Toggle user status (ACTIVE / BANNED)
 *     description: Update user account status to ACTIVE or BANNED. Requires Admin role.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User UUID
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
 *                 enum: [ACTIVE, BANNED]
 *                 example: BANNED
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "User status updated successfully!"
 *               data:
 *                 id: "u123"
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 status: "BANNED"
 *       400:
 *         description: Validation error or invalid user ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  "/users/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  validateRequest(AdminValidations.toggleUserStatusValidationSchema),
  AdminControllers.toggleUserStatus,
);

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all system bookings
 *     description: Retrieve a paginated list of all bookings in the system. Requires Admin role.
 *     tags: [Admin]
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
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction
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
 *                 total: 15
 *                 totalPage: 2
 *               data: []
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get(
  "/bookings",
  auth("ADMIN"),
  validateQuery(paginationQuerySchema),
  AdminControllers.getAllBookings,
);

/**
 * @swagger
 * /api/admin/bookings/{id}:
 *   get:
 *     summary: Get booking details by ID
 *     description: Retrieve full booking details by ID. Requires Admin role.
 *     tags: [Admin]
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
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Booking retrieved successfully!"
 *               data:
 *                 id: "b123"
 *                 status: "COMPLETED"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.get(
  "/bookings/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  AdminControllers.getBookingById,
);

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: Get all system payments
 *     description: Retrieve all recorded payments across all bookings. Requires Admin role.
 *     tags: [Admin]
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
 *         description: List of payments retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Payments retrieved successfully!"
 *               data: []
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/payments",
  auth("ADMIN"),
  validateQuery(paginationQuerySchema),
  AdminControllers.getAllPayments,
);

/**
 * @swagger
 * /api/admin/payments/{id}:
 *   get:
 *     summary: Get payment details by ID
 *     description: Retrieve payment record details by ID. Requires Admin role.
 *     tags: [Admin]
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
  "/payments/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  AdminControllers.getPaymentById,
);

/**
 * @swagger
 * /api/admin/reviews:
 *   get:
 *     summary: Get all system reviews
 *     description: Retrieve all customer reviews. Requires Admin role.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of reviews retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Reviews retrieved successfully!"
 *               data: []
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/reviews",
  auth("ADMIN"),
  AdminControllers.getAllReviews,
);

/**
 * @swagger
 * /api/admin/reviews/{id}:
 *   delete:
 *     summary: Delete review by ID
 *     description: Delete a specific review by ID. Requires Admin role.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review UUID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Review deleted successfully!"
 *               data: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
router.delete(
  "/reviews/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  AdminControllers.deleteReviewById,
);

/**
 * @swagger
 * /api/admin/technician-applications:
 *   get:
 *     summary: Get all technician applications
 *     description: Retrieve all submitted applications from customers wanting to become technicians. Requires Admin role.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Technician applications retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Technician applications retrieved successfully!"
 *               data:
 *                 - id: "app-123"
 *                   userId: "u456"
 *                   status: "PENDING"
 *                   bio: "Experienced technician..."
 *                   skills: ["Plumbing", "Electrical"]
 *                   experience: 5
 *                   hourlyRate: 50
 *                   location: "New York"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get(
  "/technician-applications",
  auth("ADMIN"),
  AdminControllers.getTechnicianApplications
);

/**
 * @swagger
 * /api/admin/technician-applications/{id}:
 *   patch:
 *     summary: Review technician application (APPROVED / REJECTED)
 *     description: Approve or reject a technician application. On approval, the user's role is updated to TECHNICIAN. Requires Admin role.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application UUID
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
 *                 enum: [APPROVED, REJECTED]
 *                 example: APPROVED
 *     responses:
 *       200:
 *         description: Application reviewed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Technician application approved successfully!"
 *               data:
 *                 id: "app-123"
 *                 status: "APPROVED"
 *       400:
 *         description: Validation error or invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application not found
 */
router.patch(
  "/technician-applications/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  AdminControllers.reviewTechnicianApplication
);

export const AdminRoutes = router;
