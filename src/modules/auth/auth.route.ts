import express from "express";
import { AuthControllers } from "./auth.controller";
import { AuthValidations } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/register",
  validateRequest(AuthValidations.registerValidationSchema),
  AuthControllers.registerUser
);

router.post(
  "/login",
  validateRequest(AuthValidations.loginValidationSchema),
  AuthControllers.loginUser
);
router.get(
  '/me',
  auth('CUSTOMER', 'TECHNICIAN', 'ADMIN'),
  AuthControllers.getMe
);

router.post(
  '/logout',
  auth('CUSTOMER', 'TECHNICIAN', 'ADMIN'),
  AuthControllers.logout
);

export const AuthRoutes = router;
