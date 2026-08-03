import express from "express";
import { CategoryControllers } from "./category.controller";
import { CategoryValidations } from "./category.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema, paginationQuerySchema } from "../../validations";
import { auth } from "../../middlewares/auth";
import validateQuery from "../../middlewares/validateQuery";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Category administration operations
 */

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories (Admin)
 *     description: Retrieve a paginated list of all service categories. Requires Admin role.
 *     tags: [Category]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search category name
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Categories retrieved successfully!"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 5
 *                 totalPage: 1
 *               data: []
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get(
  "/",
  auth("ADMIN"),
  validateQuery(paginationQuerySchema),
  CategoryControllers.getAllCategoriesAdmin,
);

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create a new service category
 *     description: Create a category (e.g., Plumbing, Electrical, Cleaning). Requires Admin role.
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name (unique)
 *                 example: Plumbing
 *               description:
 *                 type: string
 *                 description: Category description
 *                 example: Plumbing repair, installation, and pipe maintenance services.
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 201
 *               message: "Category created successfully!"
 *               data:
 *                 id: "cat-123"
 *                 name: "Plumbing"
 *                 description: "Plumbing repair, installation, and pipe maintenance services."
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       409:
 *         description: Category name already exists
 */
router.post(
  "/",
  auth("ADMIN"),
  validateRequest(CategoryValidations.createCategoryValidationSchema),
  CategoryControllers.createCategory,
);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   patch:
 *     summary: Update an existing category
 *     description: Update name or description of a category by ID. Requires Admin role.
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category UUID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Plumbing Services
 *               description:
 *                 type: string
 *                 example: Updated plumbing description
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already taken
 */
router.patch(
  "/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  validateRequest(CategoryValidations.updateCategoryValidationSchema),
  CategoryControllers.updateCategory,
);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     description: Delete a category by ID. Requires Admin role.
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category UUID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Category deleted successfully!"
 *               data: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 */
router.delete(
  "/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  CategoryControllers.deleteCategory,
);

export const CategoryRoutes = router;
