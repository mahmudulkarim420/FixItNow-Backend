import express, { Request, Response, NextFunction } from "express";
import { AuthRoutes } from "./modules/auth/auth.route";
import { ServiceRoutes } from "./modules/service/service.route";
import { BookingRoutes } from "./modules/booking/booking.route";
import { PaymentRoutes } from "./modules/payment/payment.route";
import AppError from "./utils/AppError";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Database is connected" });
});

app.use("/api/auth", AuthRoutes);
app.use("/api/services", ServiceRoutes);
app.use("/api/bookings", BookingRoutes);
app.use("/api/payments", PaymentRoutes);

app.use((req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.originalUrl}`));
});

app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof Error && typeof (err as AppError).statusCode === "number") {
      const appErr = err as AppError;
      res.status(appErr.statusCode).json({
        success: false,
        message: appErr.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

export default app;
