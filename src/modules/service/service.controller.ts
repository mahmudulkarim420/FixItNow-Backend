import { Request, Response, NextFunction } from "express";
import { ServiceServices } from "./service.service";
import sendResponse from "../../utils/sendResponse";

const getAllServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceServices.getAllServices(req.query);

    sendResponse(res, {
      statusCode: 200,
      message: "Services retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTechnicians = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceServices.getAllTechnicians(req.query);

    sendResponse(res, {
      statusCode: 200,
      message: "Technicians retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTechnicianById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceServices.getTechnicianById(req.params.id as string);

    sendResponse(res, {
      statusCode: 200,
      message: "Technician retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceServices.getAllCategories(req.query);

    sendResponse(res, {
      statusCode: 200,
      message: "Categories retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ServiceControllers = {
  getAllServices,
  getAllTechnicians,
  getTechnicianById,
  getAllCategories,
};
