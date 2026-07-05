import { Request, Response, NextFunction } from "express";
import { BookingServices } from "./booking.service";

const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingServices.createBooking(req.user!.id as string, req.body);

    res.status(201).json({
      success: true,
      message: "Booking created successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingServices.getAllBookings(req.user!.id as string, req.user!.role as string);

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingServices.getBookingById(
      req.params.id as string,
      req.user!.id as string,
      req.user!.role as string
    );

    res.status(200).json({
      success: true,
      message: "Booking retrieved successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const BookingControllers = {
  createBooking,
  getAllBookings,
  getBookingById,
};
