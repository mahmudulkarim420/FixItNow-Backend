import { Request, Response } from "express";
import { ServiceServices } from "./service.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await ServiceServices.getAllServices(req.query);

  sendResponse(res, {
    statusCode: 200,
    message: "Services retrieved successfully!",
    meta,
    data,
  });
});

const getServiceById = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.getServiceById(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Service retrieved successfully!",
    data: result,
  });
});

const createService = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.createService(req.user!.id as string, req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "Service created successfully!",
    data: result,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.updateService(
    req.params.id as string,
    req.user!.id as string,
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Service updated successfully!",
    data: result,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.deleteService(
    req.params.id as string,
    req.user!.id as string
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Service deleted successfully!",
    data: result,
  });
});

const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await ServiceServices.getAllTechnicians(req.query);

  sendResponse(res, {
    statusCode: 200,
    message: "Technicians retrieved successfully!",
    meta,
    data,
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
  getServiceById,
  createService,
  updateService,
  deleteService,
  getAllTechnicians,
  getTechnicianById,
  getAllCategories,
};
