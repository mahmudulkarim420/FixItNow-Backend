import express from "express";
import { AdminControllers } from "./admin.controller";
import { AdminValidations } from "./admin.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.get("/users", auth("ADMIN"), AdminControllers.getAllUsers);

router.patch(
  "/users/:id",
  auth("ADMIN"),
  validateRequest(AdminValidations.toggleUserStatusValidationSchema),
  AdminControllers.toggleUserStatus
);

router.get("/bookings", auth("ADMIN"), AdminControllers.getAllBookings);

router.get("/categories", auth("ADMIN"), AdminControllers.getAllCategoriesAdmin);

router.post(
  "/categories",
  auth("ADMIN"),
  validateRequest(AdminValidations.createCategoryValidationSchema),
  AdminControllers.createCategory
);

export const AdminRoutes = router;
