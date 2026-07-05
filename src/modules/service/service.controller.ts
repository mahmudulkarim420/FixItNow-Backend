import { Request, Response, NextFunction } from "express";
import { ServiceServices } from "./service.service";

const getAllServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceServices.getAllServices(req.query);

    res.status(200).json({
      success: true,
      message: "Services retrieved successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getAllTechnicians = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceServices.getAllTechnicians(req.query);

    res.status(200).json({
      success: true,
      message: "Technicians retrieved successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getTechnicianById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceServices.getTechnicianById(req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Technician retrieved successfully!",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const ServiceControllers = {
  getAllServices,
  getAllTechnicians,
  getTechnicianById,
};
