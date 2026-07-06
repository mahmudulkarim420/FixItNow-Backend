import { Request, Response } from "express";
import { BookingServices } from "./booking.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.createBooking(req.user!.id as string, req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "Booking created successfully!",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.getAllBookings(req.user!.id as string, req.user!.role as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Bookings retrieved successfully!",
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
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
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.cancelBooking(
    req.params.id as string,
    req.user!.id as string
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Booking cancelled successfully!",
    data: result,
  });
});

export const BookingControllers = {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
};
