import { Request, Response, NextFunction } from "express";
import { TechnicianServices } from "./technician.service";
import sendResponse from "../../utils/sendResponse";

const getTechnicianBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TechnicianServices.getTechnicianBookings(req.user!.id as string);

    sendResponse(res, {
      statusCode: 200,
      message: "Technician bookings retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TechnicianServices.updateBookingStatus(
      req.params.id as string,
      req.user!.id as string,
      req.body.status,
    );

    sendResponse(res, {
      statusCode: 200,
      message: "Booking status updated successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TechnicianServices.updateProfile(req.user!.id as string, req.body);

    sendResponse(res, {
      statusCode: 200,
      message: "Profile updated successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TechnicianServices.updateAvailability(
      req.user!.id as string,
      req.body.availability,
    );

    sendResponse(res, {
      statusCode: 200,
      message: "Availability updated successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const TechnicianControllers = {
  getTechnicianBookings,
  updateBookingStatus,
  updateProfile,
  updateAvailability,
};
