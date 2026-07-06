import { Response } from "express";

type TResponseMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPage?: number;
};

type TSendResponse<T> = {
  statusCode: number;
  success?: boolean;
  message: string;
  data: T;
  meta?: TResponseMeta;
};

const sendResponse = <T>(res: Response, payload: TSendResponse<T>) => {
  const { statusCode, success = true, message, data, meta } = payload;

  res.status(statusCode).json({
    success,
    statusCode,
    message,
    meta,
    data,
  });
};

export default sendResponse;
