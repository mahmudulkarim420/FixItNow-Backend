import { Request, Response, NextFunction } from "express";
import { TechnicianServices } from "./technician.service";

const getTechnicianBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TechnicianServices.getTechnicianBookings(req.user!.id as string);

    res.status(200).json({
      success: true,
      message: "Technician bookings retrieved successfully!",
      data: result,
    });
  } catch (error: any) {
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

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TechnicianServices.updateProfile(req.user!.id as string, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TechnicianServices.updateAvailability(
      req.user!.id as string,
      req.body.availability,
    );

    res.status(200).json({
      success: true,
      message: "Availability updated successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const TechnicianControllers = {
  getTechnicianBookings,
  updateBookingStatus,
  updateProfile,
  updateAvailability,
};
