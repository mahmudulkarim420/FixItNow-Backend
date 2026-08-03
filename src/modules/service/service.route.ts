import express from "express";
import { ServiceControllers } from "./service.controller";
import { ServiceValidations } from "./service.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import validateQuery from "../../middlewares/validateQuery";
import { idParamValidationSchema, paginationQuerySchema } from "../../validations";
import { auth } from "../../middlewares/auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Service
 *   description: Service offerings management & public catalog
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all services
 *     description: Retrieve a paginated list of services. Supports filtering by category, search term, and price range.
 *     tags: [Service]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by Category UUID
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field name to sort by (e.g. price, title, createdAt)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Services retrieved successfully!"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 12
 *                 totalPage: 2
 *               data: []
 */
router.get("/", validateQuery(paginationQuerySchema), ServiceControllers.getAllServices);

/**
 * @swagger
 * /api/services/categories:
 *   get:
 *     summary: Get public service categories
 *     description: Retrieve categories with active service counts for public browsing.
 *     tags: [Service]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Categories retrieved successfully!"
 *               data: []
 */
router.get(
  "/categories",
  validateQuery(paginationQuerySchema),
  ServiceControllers.getAllCategories,
);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service details by ID
 *     description: Retrieve full details of a specific service.
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service UUID
 *     responses:
 *       200:
 *         description: Service details retrieved successfully
 *       404:
 *         description: Service not found
 */
router.get("/:id", validateParams(idParamValidationSchema), ServiceControllers.getServiceById);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service
 *     description: Create a new service offered by the technician. Requires TECHNICIAN role.
 *     tags: [Service]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - title
 *               - description
 *               - price
 *             properties:
 *               categoryId:
 *                 type: string
 *                 description: Valid Category UUID
 *                 example: "cat-123"
 *               title:
 *                 type: string
 *                 example: "Residential Plumbing Leak Repair"
 *               description:
 *                 type: string
 *                 example: "Fix leaking pipes, faucets, and drain issues."
 *               price:
 *                 type: number
 *                 example: 85.50
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 201
 *               message: "Service created successfully!"
 *               data:
 *                 id: "s123"
 *                 title: "Residential Plumbing Leak Repair"
 *                 price: 85.50
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Technicians only)
 */
router.post(
  "/",
  auth("TECHNICIAN"),
  validateRequest(ServiceValidations.createServiceValidationSchema),
  ServiceControllers.createService,
);

/**
 * @swagger
 * /api/services/{id}:
 *   patch:
 *     summary: Update an existing service
 *     description: Update service details. Requires TECHNICIAN role and ownership of the service.
 *     tags: [Service]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service UUID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Advanced Plumbing Repair"
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 95.00
 *               categoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service not found
 */
router.patch(
  "/:id",
  auth("TECHNICIAN"),
  validateParams(idParamValidationSchema),
  validateRequest(ServiceValidations.updateServiceValidationSchema),
  ServiceControllers.updateService,
);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Delete a service
 *     description: Delete a service by ID. Requires TECHNICIAN role and ownership of the service.
 *     tags: [Service]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service UUID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Service deleted successfully!"
 *               data: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service not found
 */
router.delete(
  "/:id",
  auth("TECHNICIAN"),
  validateParams(idParamValidationSchema),
  ServiceControllers.deleteService,
);

export const ServiceRoutes = router;
