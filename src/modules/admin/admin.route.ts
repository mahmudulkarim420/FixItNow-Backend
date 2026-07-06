import express from "express";
import { AdminControllers } from "./admin.controller";
import { AdminValidations } from "./admin.validation";
import validateRequest from "../../middlewares/validateRequest";
import validateParams from "../../middlewares/validateParams";
import { idParamValidationSchema } from "../../validations";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.get("/users", auth("ADMIN"), AdminControllers.getAllUsers);

router.patch(
  "/users/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  validateRequest(AdminValidations.toggleUserStatusValidationSchema),
  AdminControllers.toggleUserStatus
);

router.get("/bookings", auth("ADMIN"), AdminControllers.getAllBookings);
router.get(
  "/bookings/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  AdminControllers.getBookingById
);

router.get("/payments", auth("ADMIN"), AdminControllers.getAllPayments);
router.get(
  "/payments/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  AdminControllers.getPaymentById
);

router.get("/categories", auth("ADMIN"), AdminControllers.getAllCategoriesAdmin);

router.post(
  "/categories",
  auth("ADMIN"),
  validateRequest(AdminValidations.createCategoryValidationSchema),
  AdminControllers.createCategory
);

router.patch(
  "/categories/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  validateRequest(AdminValidations.updateCategoryValidationSchema),
  AdminControllers.updateCategory
);

router.delete(
  "/categories/:id",
  auth("ADMIN"),
  validateParams(idParamValidationSchema),
  AdminControllers.deleteCategory
);

export const AdminRoutes = router;
