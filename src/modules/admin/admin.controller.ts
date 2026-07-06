import { Request, Response } from "express";
import { AdminServices } from "./admin.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllUsers();

  sendResponse(res, {
    statusCode: 200,
    message: "Users retrieved successfully!",
    data: result,
  });
});

const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.toggleUserStatus(
    req.params.id as string,
    req.body.status
  );

  sendResponse(res, {
    statusCode: 200,
    message: "User status updated successfully!",
    data: result,
  });
});

const getAllBookings = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllBookings();

  sendResponse(res, {
    statusCode: 200,
    message: "Bookings retrieved successfully!",
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getBookingById(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Booking retrieved successfully!",
    data: result,
  });
});

const getAllCategoriesAdmin = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllCategoriesAdmin();

  sendResponse(res, {
    statusCode: 200,
    message: "Categories retrieved successfully!",
    data: result,
  });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.createCategory(req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "Category created successfully!",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.updateCategory(
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Category updated successfully!",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.deleteCategory(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Category deleted successfully!",
    data: result,
  });
});

const getAllPayments = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllPayments();

  sendResponse(res, {
    statusCode: 200,
    message: "Payments retrieved successfully!",
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getPaymentById(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Payment retrieved successfully!",
    data: result,
  });
});

export const AdminControllers = {
  getAllUsers,
  toggleUserStatus,
  getAllBookings,
  getBookingById,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllPayments,
  getPaymentById,
};
