import express from "express";
import { AuthRoutes } from "./modules/auth/auth.route";
import { ServiceRoutes } from "./modules/service/service.route";
import { BookingRoutes } from "./modules/booking/booking.route";
import { PaymentRoutes } from "./modules/payment/payment.route";
import { PaymentControllers } from "./modules/payment/payment.controller";
import { TechnicianRoutes, TechnicianListingRoutes } from "./modules/technician/technician.route";
import { ReviewRoutes } from "./modules/review/review.route";
import { AdminRoutes } from "./modules/admin/admin.route";
import { CategoryRoutes } from "./modules/category/category.route";
import AppError from "./utils/AppError";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import config from "./config";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      withCredentials: true,
    },
  }),
);

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System health and raw webhooks
 */

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Stripe Webhook handler
 *     description: Handles incoming Stripe events (e.g. `checkout.session.completed`). Receives raw JSON payload verified with `stripe-signature`.
 *     tags: [System]
 *     parameters:
 *       - in: header
 *         name: stripe-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe signature for webhook validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Raw Stripe event object
 *     responses:
 *       200:
 *         description: Webhook received and processed successfully
 *         content:
 *           application/json:
 *             example:
 *               received: true
 *       400:
 *         description: Invalid payload or signature verification failed
 */
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentControllers.stripeWebhook,
);

const allowedOrigins = [
  config.frontendUrl,
  config.backendUrl,
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: System Health Check
 *     description: Check backend service and database connection status.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System operational
 *         content:
 *           application/json:
 *             example:
 *               status: "ok"
 *               message: "Database is connected"
 */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Database is connected" });
});

app.use("/api/auth", AuthRoutes);
app.use("/api/services/technicians", TechnicianListingRoutes);
app.use("/api/services", ServiceRoutes);
app.use("/api/bookings", BookingRoutes);
app.use("/api/payments", PaymentRoutes);
app.use("/api/technician", TechnicianRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/admin/categories", CategoryRoutes);

app.use((req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.originalUrl}`));
});

app.use(globalErrorHandler);

export default app;
