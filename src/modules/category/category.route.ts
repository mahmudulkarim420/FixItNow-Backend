import express from "express";
import { CategoryControllers } from "./category.controller";
import { CategoryValidations } from "./category.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema } from "../../validations";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.get("/", auth("ADMIN"), CategoryControllers.getAllCategoriesAdmin);

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(CategoryValidations.createCategoryValidationSchema),
  CategoryControllers.createCategory
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  validateRequest(CategoryValidations.updateCategoryValidationSchema),
  CategoryControllers.updateCategory
);

router.delete(
  "/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  CategoryControllers.deleteCategory
);

export const CategoryRoutes = router;
