import { Request, Response, NextFunction } from "express";
import { AdminServices } from "./admin.service";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminServices.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminServices.toggleUserStatus(
      req.params.id as string,
      req.body.status
    );

    res.status(200).json({
      success: true,
      message: "User status updated successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminServices.getAllBookings();

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getAllCategoriesAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminServices.getAllCategoriesAdmin();

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminServices.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const AdminControllers = {
  getAllUsers,
  toggleUserStatus,
  getAllBookings,
  getAllCategoriesAdmin,
  createCategory,
};
