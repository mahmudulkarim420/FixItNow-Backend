import { Request, Response, NextFunction } from "express";
import { BookingServices } from "./booking.service";
import sendResponse from "../../utils/sendResponse";

const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingServices.createBooking(req.user!.id as string, req.body);

    sendResponse(res, {
      statusCode: 201,
      message: "Booking created successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingServices.getAllBookings(req.user!.id as string, req.user!.role as string);

    sendResponse(res, {
      statusCode: 200,
      message: "Bookings retrieved successfully!",
      data: result,
    });
  } catch (error) {
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

    sendResponse(res, {
      statusCode: 200,
      message: "Booking retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const BookingControllers = {
  createBooking,
  getAllBookings,
  getBookingById,
};
