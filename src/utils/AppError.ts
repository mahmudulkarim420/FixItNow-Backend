import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

class AppError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default AppError;
