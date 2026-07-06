import { Request, Response } from "express";
import { ServiceServices } from "./service.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.getAllServices(req.query);

  sendResponse(res, {
    statusCode: 200,
    message: "Services retrieved successfully!",
    data: result,
  });
});

const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.getAllTechnicians(req.query);

  sendResponse(res, {
    statusCode: 200,
    message: "Technicians retrieved successfully!",
    data: result,
  });
});

const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.getTechnicianById(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Technician retrieved successfully!",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.getAllCategories(req.query);

  sendResponse(res, {
    statusCode: 200,
    message: "Categories retrieved successfully!",
    data: result,
  });
});

export const ServiceControllers = {
  getAllServices,
  getAllTechnicians,
  getTechnicianById,
  getAllCategories,
};
