import { Request, Response, NextFunction } from "express";
import { AdminServices } from "./admin.service";
import sendResponse from "../../utils/sendResponse";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminServices.getAllUsers();

    sendResponse(res, {
      statusCode: 200,
      message: "Users retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminServices.toggleUserStatus(
      req.params.id as string,
      req.body.status
    );

    sendResponse(res, {
      statusCode: 200,
      message: "User status updated successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminServices.getAllBookings();

    sendResponse(res, {
      statusCode: 200,
      message: "Bookings retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCategoriesAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminServices.getAllCategoriesAdmin();

    sendResponse(res, {
      statusCode: 200,
      message: "Categories retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminServices.createCategory(req.body);

    sendResponse(res, {
      statusCode: 201,
      message: "Category created successfully!",
      data: result,
    });
  } catch (error) {
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
