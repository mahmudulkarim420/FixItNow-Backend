// src/app.ts
import express9 from "express";

// src/modules/auth/auth.route.ts
import express from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// src/lib/prisma.ts
import "dotenv/config";
import https from "https";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
if (!process.env.VERCEL && !process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV !== "production") {
  neonConfig.fetchFunction = function(url, options2 = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = typeof url === "string" ? new URL(url) : url;
      const reqHeaders = {};
      if (options2.headers) {
        if (typeof options2.headers.forEach === "function") {
          options2.headers.forEach((v, k) => {
            reqHeaders[k] = v;
          });
        } else {
          Object.assign(reqHeaders, options2.headers);
        }
      }
      const reqOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options2.method || "POST",
        headers: reqHeaders,
        family: 4
      };
      const req = https.request(reqOptions, (res) => {
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", () => {
          const respHeaders = new Headers();
          for (const [k, v] of Object.entries(res.headers)) {
            if (Array.isArray(v)) {
              v.forEach((val) => respHeaders.append(k, val));
            } else if (v !== void 0) {
              respHeaders.set(k, v);
            }
          }
          resolve({
            ok: res.statusCode ? res.statusCode >= 200 && res.statusCode < 300 : false,
            status: res.statusCode || 500,
            statusText: res.statusMessage || "",
            headers: respHeaders,
            json: () => Promise.resolve(data ? JSON.parse(data) : null),
            text: () => Promise.resolve(data),
            arrayBuffer: () => Promise.resolve(Buffer.from(data))
          });
        });
      });
      req.on("error", reject);
      if (options2.body) req.write(options2.body);
      req.end();
    });
  };
}
var connectionString = process.env.DATABASE_URL || "";
if (!connectionString) {
  console.warn("\u26A0\uFE0F DATABASE_URL environment variable is missing in environment settings.");
}
var adapter = new PrismaNeonHttp(connectionString || "postgresql://invalid:invalid@localhost:5432/invalid", {
  arrayMode: false,
  fullResults: false
});
var prisma = new PrismaClient({ adapter });

// src/utils/AppError.ts
var AppError = class _AppError extends Error {
  statusCode;
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
    Error.captureStackTrace(this, _AppError);
  }
};
var AppError_default = AppError;

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var config = {
  port: process.env.PORT || 5001,
  backendUrl: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`,
  database: {
    url: process.env.DATABASE_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh_secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    publicKey: process.env.STRIPE_PUBLIC_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? ""
  },
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV ?? "development"
};
var config_default = config;

// src/utils/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
var cloudName = process.env.CLOUDINARY_CLOUD_NAME;
var apiKey = process.env.CLOUDINARY_API_KEY;
var apiSecret = process.env.CLOUDINARY_API_SECRET;
var isCloudinaryConfigured = () => {
  if (!cloudName || !apiKey || !apiSecret) return false;
  if (apiKey.includes("GkyKKPhQyoE") || apiKey === "your_api_key" || apiSecret.includes("GkyKKPhQyoE") || apiSecret === "your_api_secret") {
    return false;
  }
  return true;
};
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}
var uploadToCloudinary = async (fileStr, folder = "fixitnow/avatars") => {
  if (!fileStr || typeof fileStr !== "string" || !fileStr.trim()) {
    return null;
  }
  if (fileStr.startsWith("http://") || fileStr.startsWith("https://")) {
    return fileStr;
  }
  if (!isCloudinaryConfigured()) {
    return fileStr;
  }
  try {
    const result = await cloudinary.uploader.upload(fileStr, {
      folder,
      resource_type: "image"
    });
    return result.secure_url || fileStr;
  } catch (error) {
    console.warn("Cloudinary upload failed, falling back to database storage:", error);
    return fileStr;
  }
};

// src/modules/auth/auth.service.ts
var registerUser = async (payload) => {
  const isUserExists = await prisma.user.findUnique({
    where: { email: payload.email }
  });
  if (isUserExists) {
    throw new AppError_default(409, "User already exists with this email!");
  }
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const avatarUrl = payload.avatar ? await uploadToCloudinary(payload.avatar) : null;
  const userRole = payload.role || "CUSTOMER";
  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: userRole,
      avatar: avatarUrl
    }
  });
  if (payload.role === "TECHNICIAN") {
    await prisma.technicianProfile.create({
      data: {
        userId: newUser.id,
        experience: 0,
        hourlyRate: 0,
        location: "",
        availability: {}
      }
    });
  }
  return prisma.user.findUnique({
    where: { id: newUser.id },
    omit: { password: true },
    include: { technicianProfile: payload.role === "TECHNICIAN" }
  });
};
var loginUser = async (payload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });
  if (!user) {
    throw new AppError_default(404, "User not found!");
  }
  if (user.status === "BANNED") {
    throw new AppError_default(403, "This user account has been banned!");
  }
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isPasswordMatched) {
    throw new AppError_default(401, "Invalid password!");
  }
  const jwtPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(jwtPayload, config_default.jwt.secret, {
    expiresIn: config_default.jwt.expiresIn
  });
  const refreshToken3 = jwt.sign(jwtPayload, config_default.jwt.refreshSecret, {
    expiresIn: config_default.jwt.refreshExpiresIn
  });
  const userWithoutPassword = await prisma.user.findUnique({
    where: { email: payload.email },
    omit: { password: true },
    include: { technicianProfile: true }
  });
  return { accessToken, refreshToken: refreshToken3, user: userWithoutPassword };
};
var getMe = async (userId) => {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
    include: { technicianProfile: true }
  });
  if (!result) {
    throw new AppError_default(404, "User not found!");
  }
  return result;
};
var refreshToken = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, config_default.jwt.refreshSecret);
  } catch {
    throw new AppError_default(401, "Invalid or expired refresh token!");
  }
  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  });
  if (!user) {
    throw new AppError_default(404, "User not found!");
  }
  if (user.status === "BANNED") {
    throw new AppError_default(403, "This user account has been banned!");
  }
  const jwtPayload = { id: user.id, email: user.email, role: user.role };
  const newAccessToken = jwt.sign(
    jwtPayload,
    config_default.jwt.secret,
    { expiresIn: config_default.jwt.expiresIn }
  );
  const newRefreshToken = jwt.sign(
    jwtPayload,
    config_default.jwt.refreshSecret,
    { expiresIn: config_default.jwt.refreshExpiresIn }
  );
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
var updateProfile = async (userId, payload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { technicianProfile: true }
  });
  if (!user) {
    throw new AppError_default(404, "User not found!");
  }
  if (user.status === "BANNED") {
    throw new AppError_default(403, "This user account has been banned!");
  }
  if (payload.email && payload.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email }
    });
    if (existingUser) {
      throw new AppError_default(409, "Email is already taken by another account!");
    }
  }
  const userDataToUpdate = {};
  if (payload.name) userDataToUpdate.name = payload.name;
  if (payload.email) userDataToUpdate.email = payload.email;
  if (payload.avatar !== void 0) {
    userDataToUpdate.avatar = payload.avatar ? await uploadToCloudinary(payload.avatar) : null;
  }
  if (payload.password) {
    userDataToUpdate.password = await bcrypt.hash(payload.password, 10);
  }
  const { bio, skills, experience, hourlyRate, location } = payload;
  const hasTechnicianData = bio !== void 0 || skills !== void 0 || experience !== void 0 || hourlyRate !== void 0 || location !== void 0;
  if (Object.keys(userDataToUpdate).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: userDataToUpdate
    });
  }
  if (hasTechnicianData && user.role === "TECHNICIAN") {
    const techDataToUpdate = {};
    if (bio !== void 0) techDataToUpdate.bio = bio;
    if (skills !== void 0) techDataToUpdate.skills = skills;
    if (experience !== void 0) techDataToUpdate.experience = experience;
    if (hourlyRate !== void 0) techDataToUpdate.hourlyRate = hourlyRate;
    if (location !== void 0) techDataToUpdate.location = location;
    await prisma.technicianProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: bio || "",
        skills: skills || [],
        experience: experience || 0,
        hourlyRate: hourlyRate || 0,
        location: location || ""
      },
      update: techDataToUpdate
    });
  }
  return prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
    include: { technicianProfile: true }
  });
};
var deleteProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new AppError_default(404, "User not found!");
  }
  await prisma.user.delete({
    where: { id: userId }
  });
  return null;
};
var AuthServices = {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  updateProfile,
  deleteProfile
};

// src/utils/sendResponse.ts
var sendResponse = (res, payload) => {
  const { statusCode, success = true, message, data, meta } = payload;
  res.status(statusCode).json({
    success,
    statusCode,
    message,
    meta,
    data
  });
};
var sendResponse_default = sendResponse;

// src/utils/catchAsync.ts
var catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
var catchAsync_default = catchAsync;

// src/modules/auth/auth.controller.ts
var registerUser2 = catchAsync_default(async (req, res) => {
  const result = await AuthServices.registerUser(req.body);
  sendResponse_default(res, {
    statusCode: 201,
    message: "User registered successfully!",
    data: result
  });
});
var loginUser2 = catchAsync_default(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  sendResponse_default(res, {
    statusCode: 200,
    message: "User logged in successfully!",
    data: result.user
  });
});
var getMe2 = catchAsync_default(async (req, res) => {
  const result = await AuthServices.getMe(req.user.id);
  sendResponse_default(res, {
    statusCode: 200,
    message: "User profile retrieved successfully!",
    data: result
  });
});
var logout = catchAsync_default(async (_req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  sendResponse_default(res, {
    statusCode: 200,
    message: "User logged out successfully!",
    data: null
  });
});
var refreshToken2 = catchAsync_default(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    throw new AppError_default(401, "Refresh token is missing!");
  }
  const result = await AuthServices.refreshToken(token);
  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  sendResponse_default(res, {
    statusCode: 200,
    message: "Access token refreshed successfully!",
    data: {
      refreshed: true
    }
  });
});
var updateProfile2 = catchAsync_default(async (req, res) => {
  const result = await AuthServices.updateProfile(req.user.id, req.body);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Profile updated successfully!",
    data: result
  });
});
var deleteProfile2 = catchAsync_default(async (req, res) => {
  await AuthServices.deleteProfile(req.user.id);
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  sendResponse_default(res, {
    statusCode: 200,
    message: "User account deleted successfully!",
    data: null
  });
});
var AuthControllers = {
  registerUser: registerUser2,
  loginUser: loginUser2,
  getMe: getMe2,
  logout,
  refreshToken: refreshToken2,
  updateProfile: updateProfile2,
  deleteProfile: deleteProfile2
};

// src/modules/auth/auth.validation.ts
import { z } from "zod";
var registerValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: "Name is required" }).trim().min(1, "Name cannot be empty"),
    email: z.string({ message: "Email is required" }).trim().email("Invalid email address"),
    password: z.string({ message: "Password is required" }).min(6, "Password must be at least 6 characters long"),
    role: z.enum(["CUSTOMER", "TECHNICIAN"]).optional().default("CUSTOMER"),
    avatar: z.string().optional()
  }).passthrough()
});
var loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is required" }).trim().email("Invalid email address"),
    password: z.string({ message: "Password is required" }).min(1, "Password cannot be empty")
  }).strict()
});
var updateProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name cannot be empty").optional(),
    email: z.string().trim().email("Invalid email address").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
    experience: z.number().min(0, "Experience must be non-negative").optional(),
    hourlyRate: z.number().min(0, "Hourly rate must be non-negative").optional(),
    location: z.string().optional()
  }).strict()
});
var AuthValidations = {
  registerValidationSchema,
  loginValidationSchema,
  updateProfileValidationSchema
};

// src/middlewares/validateRequest.ts
import { ZodError } from "zod";
var validateRequest = (schema) => async (req, _res, next) => {
  try {
    await schema.parseAsync({ body: req.body });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => i.message).join(", ");
      next(new AppError_default(400, message));
    } else {
      next(error);
    }
  }
};
var validateRequest_default = validateRequest;

// src/middlewares/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...requiredRoles) => {
  return async (req, _res, next) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        throw new AppError_default(401, "You are not authorized! Token missing.");
      }
      const decoded = jwt2.verify(token, config_default.jwt.secret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, status: true, role: true }
      });
      if (!user) {
        throw new AppError_default(401, "User no longer exists!");
      }
      if (user.status === "BANNED") {
        throw new AppError_default(403, "This user account has been banned!");
      }
      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        throw new AppError_default(403, "You have no permission to access this route!");
      }
      req.user = { ...decoded, id: user.id, role: user.role };
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/modules/auth/auth.route.ts
var router = express.Router();
router.post(
  "/register",
  validateRequest_default(AuthValidations.registerValidationSchema),
  AuthControllers.registerUser
);
router.post(
  "/login",
  validateRequest_default(AuthValidations.loginValidationSchema),
  AuthControllers.loginUser
);
router.get("/me", auth("CUSTOMER", "TECHNICIAN", "ADMIN"), AuthControllers.getMe);
router.patch(
  "/me",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  validateRequest_default(AuthValidations.updateProfileValidationSchema),
  AuthControllers.updateProfile
);
router.delete("/me", auth("CUSTOMER", "TECHNICIAN", "ADMIN"), AuthControllers.deleteProfile);
router.post("/logout", auth("CUSTOMER", "TECHNICIAN", "ADMIN"), AuthControllers.logout);
router.post("/refresh", AuthControllers.refreshToken);
var AuthRoutes = router;

// src/modules/service/service.route.ts
import express2 from "express";

// src/utils/pagination.ts
var parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
  return { page, limit, skip, take: limit, sortBy, sortOrder };
};
var buildMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPage: Math.ceil(total / limit)
});

// src/modules/service/service.service.ts
var getAllServices = async (query) => {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(query);
  const where = {};
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } }
    ];
  }
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
    if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
  }
  const [data, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        technicianProfile: {
          select: {
            id: true,
            user: { select: { name: true, email: true } }
          }
        }
      }
    }),
    prisma.service.count({ where })
  ]);
  return { data, meta: buildMeta(page, limit, total) };
};
var getServiceById = async (id) => {
  const result = await prisma.service.findUnique({
    where: { id },
    include: {
      category: true,
      technicianProfile: {
        select: {
          id: true,
          user: { select: { name: true, email: true } }
        }
      }
    }
  });
  if (!result) {
    throw new AppError_default(404, "Service not found!");
  }
  return result;
};
var createService = async (userId, payload) => {
  let technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId }
  });
  if (!technicianProfile) {
    technicianProfile = await prisma.technicianProfile.create({
      data: {
        userId,
        experience: 0,
        hourlyRate: 0,
        location: ""
      }
    });
  }
  let category = await prisma.category.findUnique({
    where: { id: payload.categoryId }
  }).catch(() => null);
  if (!category) {
    category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "General Services",
          description: "General home repair and maintenance services"
        }
      });
    }
  }
  const createdService = await prisma.service.create({
    data: {
      title: payload.title,
      description: payload.description,
      price: payload.price,
      categoryId: category.id,
      technicianProfileId: technicianProfile.id
    }
  });
  const result = await prisma.service.findUnique({
    where: { id: createdService.id },
    include: {
      category: true,
      technicianProfile: {
        select: {
          id: true,
          user: { select: { name: true, email: true } }
        }
      }
    }
  });
  return result || createdService;
};
var updateService = async (serviceId, userId, payload) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });
  if (!service) {
    throw new AppError_default(404, "Service not found!");
  }
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId }
  });
  if (!technicianProfile || service.technicianProfileId !== technicianProfile.id) {
    throw new AppError_default(403, "You are not authorized to update this service!");
  }
  const updateData = { ...payload };
  if (payload.categoryId) {
    let category = await prisma.category.findUnique({
      where: { id: payload.categoryId }
    }).catch(() => null);
    if (!category) {
      category = await prisma.category.findFirst();
      if (category) {
        updateData.categoryId = category.id;
      } else {
        delete updateData.categoryId;
      }
    }
  }
  await prisma.service.update({
    where: { id: serviceId },
    data: updateData
  });
  const result = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      category: true,
      technicianProfile: {
        select: {
          id: true,
          user: { select: { name: true, email: true } }
        }
      }
    }
  });
  return result || service;
};
var deleteService = async (serviceId, userId) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });
  if (!service) {
    throw new AppError_default(404, "Service not found!");
  }
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId }
  });
  if (!technicianProfile || service.technicianProfileId !== technicianProfile.id) {
    throw new AppError_default(403, "You are not authorized to delete this service!");
  }
  const result = await prisma.service.delete({
    where: { id: serviceId }
  });
  return result;
};
var getAllCategories = async (query) => {
  let orderBy = { createdAt: "desc" };
  if (query.sortBy === "name") {
    orderBy = { name: "asc" };
  } else if (query.sortBy === "createdAt") {
    orderBy = { createdAt: "desc" };
  }
  const result = await prisma.category.findMany({
    orderBy,
    include: {
      _count: { select: { services: true } }
    }
  });
  return result;
};
var ServiceServices = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getAllCategories
};

// src/modules/service/service.controller.ts
var getAllServices2 = catchAsync_default(async (req, res) => {
  const { data, meta } = await ServiceServices.getAllServices(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Services retrieved successfully!",
    meta,
    data
  });
});
var getServiceById2 = catchAsync_default(async (req, res) => {
  const result = await ServiceServices.getServiceById(req.params.id);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Service retrieved successfully!",
    data: result
  });
});
var createService2 = catchAsync_default(async (req, res) => {
  const result = await ServiceServices.createService(req.user.id, req.body);
  sendResponse_default(res, {
    statusCode: 201,
    message: "Service created successfully!",
    data: result
  });
});
var updateService2 = catchAsync_default(async (req, res) => {
  const result = await ServiceServices.updateService(
    req.params.id,
    req.user.id,
    req.body
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "Service updated successfully!",
    data: result
  });
});
var deleteService2 = catchAsync_default(async (req, res) => {
  await ServiceServices.deleteService(
    req.params.id,
    req.user.id
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "Service deleted successfully!",
    data: null
  });
});
var getAllCategories2 = catchAsync_default(async (req, res) => {
  const result = await ServiceServices.getAllCategories(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Categories retrieved successfully!",
    data: result
  });
});
var ServiceControllers = {
  getAllServices: getAllServices2,
  getServiceById: getServiceById2,
  createService: createService2,
  updateService: updateService2,
  deleteService: deleteService2,
  getAllCategories: getAllCategories2
};

// src/modules/service/service.validation.ts
import { z as z2 } from "zod";
var createServiceValidationSchema = z2.object({
  body: z2.object({
    title: z2.string({ message: "Title is required" }).trim().min(3, "Title must be at least 3 characters"),
    description: z2.string({ message: "Description is required" }).trim().min(1, "Description cannot be empty"),
    price: z2.number({ message: "Price is required" }).nonnegative("Price must be a positive number"),
    categoryId: z2.string({ message: "Category ID is required" }).uuid({ message: "Invalid Category ID format" })
  }).strict()
});
var updateServiceValidationSchema = z2.object({
  body: z2.object({
    title: z2.string({ message: "Title must be a string" }).trim().min(3, "Title must be at least 3 characters").optional(),
    description: z2.string({ message: "Description must be a string" }).trim().min(1, "Description cannot be empty").optional(),
    price: z2.number({ message: "Price must be a number" }).nonnegative("Price must be a positive number").optional(),
    categoryId: z2.string({ message: "Category ID must be a string" }).uuid({ message: "Invalid Category ID format" }).optional()
  }).strict()
});
var ServiceValidations = {
  createServiceValidationSchema,
  updateServiceValidationSchema
};

// src/middlewares/validateParams.ts
import { ZodError as ZodError2 } from "zod";
var validateParams = (schema) => async (req, _res, next) => {
  try {
    await schema.parseAsync(req.params);
    next();
  } catch (error) {
    if (error instanceof ZodError2) {
      const message = error.issues.map((i) => i.message).join(", ");
      next(new AppError_default(400, message));
    } else {
      next(error);
    }
  }
};
var validateParams_default = validateParams;

// src/middlewares/validateQuery.ts
import { ZodError as ZodError3 } from "zod";
var validateQuery = (schema) => async (req, _res, next) => {
  try {
    await schema.parseAsync(req.query);
    next();
  } catch (error) {
    if (error instanceof ZodError3) {
      const message = error.issues.map((i) => i.message).join(", ");
      next(new AppError_default(400, message));
    } else {
      next(error);
    }
  }
};
var validateQuery_default = validateQuery;

// src/validations/index.ts
import { z as z3 } from "zod";
var idParamValidationSchema = z3.object({
  id: z3.string().uuid({ message: "Invalid UUID format for id parameter" })
});
var paginationQuerySchema = z3.object({
  page: z3.string().regex(/^\d+$/, "Page must be a number").optional(),
  limit: z3.string().regex(/^\d+$/, "Limit must be a number").optional(),
  sortBy: z3.string().optional(),
  sortOrder: z3.enum(["asc", "desc"]).optional(),
  searchTerm: z3.string().optional(),
  search: z3.string().optional(),
  categoryId: z3.string().optional(),
  minPrice: z3.string().optional(),
  maxPrice: z3.string().optional()
}).passthrough();

// src/modules/service/service.route.ts
var router2 = express2.Router();
router2.get("/", validateQuery_default(paginationQuerySchema), ServiceControllers.getAllServices);
router2.get(
  "/categories",
  validateQuery_default(paginationQuerySchema),
  ServiceControllers.getAllCategories
);
router2.get("/:id", validateParams_default(idParamValidationSchema), ServiceControllers.getServiceById);
router2.post(
  "/",
  auth("TECHNICIAN"),
  validateRequest_default(ServiceValidations.createServiceValidationSchema),
  ServiceControllers.createService
);
router2.patch(
  "/:id",
  auth("TECHNICIAN"),
  validateParams_default(idParamValidationSchema),
  validateRequest_default(ServiceValidations.updateServiceValidationSchema),
  ServiceControllers.updateService
);
router2.delete(
  "/:id",
  auth("TECHNICIAN"),
  validateParams_default(idParamValidationSchema),
  ServiceControllers.deleteService
);
var ServiceRoutes = router2;

// src/modules/booking/booking.route.ts
import express3 from "express";

// src/lib/stripe.ts
import Stripe from "stripe";
var stripe = new Stripe(config_default.stripe.secretKey);
var stripe_default = stripe;

// src/modules/booking/bookingStatus.ts
var VALID_TRANSITIONS = {
  REQUESTED: ["ACCEPTED", "DECLINED", "CANCELLED"],
  ACCEPTED: ["PAID", "CANCELLED"],
  PAID: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  DECLINED: [],
  CANCELLED: []
};
var assertTransition = (from, to) => {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new AppError_default(
      400,
      `Invalid status transition: ${from} -> ${to}`
    );
  }
};

// src/modules/booking/booking.service.ts
var createBooking = async (customerId, payload) => {
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId }
  });
  if (!service) {
    throw new AppError_default(404, "Service not found!");
  }
  const created = await prisma.booking.create({
    data: {
      customerId,
      serviceId: payload.serviceId,
      technicianProfileId: service.technicianProfileId,
      servicePrice: service.price,
      contactNumber: payload.contactNumber,
      scheduledDate: new Date(payload.scheduledDate),
      timeSlot: payload.timeSlot,
      status: "REQUESTED"
    }
  });
  const result = await prisma.booking.findUnique({
    where: { id: created.id },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } }
    }
  });
  return result;
};
var getAllBookings = async (userId, role, query) => {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(query);
  const where = {};
  if (role === "CUSTOMER") {
    where.customerId = userId;
  } else if (role === "TECHNICIAN") {
    where.technicianProfile = { userId };
  }
  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        service: true,
        customer: { select: { name: true, email: true } },
        technicianProfile: { include: { user: { select: { name: true } } } },
        review: true,
        payment: true
      }
    }),
    prisma.booking.count({ where })
  ]);
  return { data, meta: buildMeta(page, limit, total) };
};
var getBookingById = async (bookingId, userId, role) => {
  const result = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
      review: true,
      payment: true
    }
  });
  if (!result) {
    throw new AppError_default(404, "Booking not found!");
  }
  const isOwner = role === "ADMIN" || result.customerId === userId || result.technicianProfile?.userId === userId;
  if (!isOwner) {
    throw new AppError_default(403, "You are not authorized to view this booking!");
  }
  return result;
};
var cancelBooking = async (bookingId, userId, reason) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true }
  });
  if (!booking) {
    throw new AppError_default(404, "Booking not found!");
  }
  if (booking.customerId !== userId) {
    throw new AppError_default(403, "You are not authorized to cancel this booking!");
  }
  if (booking.status === "CANCELLED") {
    throw new AppError_default(400, "Booking has already been cancelled.");
  }
  if (booking.status === "IN_PROGRESS") {
    throw new AppError_default(400, "Booking cannot be cancelled after the service has started.");
  }
  if (booking.status === "COMPLETED") {
    throw new AppError_default(400, "Completed bookings cannot be cancelled.");
  }
  assertTransition(booking.status, "CANCELLED");
  const completedPayment = booking.payment && booking.payment.status === "COMPLETED" ? booking.payment : null;
  if (completedPayment) {
    if (completedPayment.transactionId && completedPayment.transactionId.startsWith("pi_")) {
      try {
        await stripe_default.refunds.create({
          payment_intent: completedPayment.transactionId
        });
      } catch (stripeErr) {
        console.error("Stripe refund exception during cancellation:", stripeErr);
      }
    }
    await prisma.payment.update({
      where: { bookingId },
      data: { status: "REFUNDED" }
    });
  }
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED", cancellationReason: reason }
  });
  const result = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
      payment: true
    }
  });
  return result;
};
var BookingServices = {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking
};

// src/modules/booking/booking.controller.ts
var createBooking2 = catchAsync_default(async (req, res) => {
  const result = await BookingServices.createBooking(req.user.id, req.body);
  sendResponse_default(res, {
    statusCode: 201,
    message: "Booking created successfully!",
    data: result
  });
});
var getAllBookings2 = catchAsync_default(async (req, res) => {
  const { data, meta } = await BookingServices.getAllBookings(
    req.user.id,
    req.user.role,
    req.query
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "Bookings retrieved successfully!",
    meta,
    data
  });
});
var getBookingById2 = catchAsync_default(async (req, res) => {
  const result = await BookingServices.getBookingById(
    req.params.id,
    req.user.id,
    req.user.role
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "Booking retrieved successfully!",
    data: result
  });
});
var cancelBooking2 = catchAsync_default(async (req, res) => {
  const result = await BookingServices.cancelBooking(
    req.params.id,
    req.user.id,
    req.body.reason
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "Booking cancelled successfully!",
    data: result
  });
});
var BookingControllers = {
  createBooking: createBooking2,
  getAllBookings: getAllBookings2,
  getBookingById: getBookingById2,
  cancelBooking: cancelBooking2
};

// src/modules/booking/booking.validation.ts
import { z as z4 } from "zod";
var createBookingValidationSchema = z4.object({
  body: z4.object({
    serviceId: z4.string({ message: "Service ID is required" }).uuid({ message: "Invalid Service ID format" }),
    scheduledDate: z4.string().date({ message: "Invalid date format. Use YYYY-MM-DD" }),
    timeSlot: z4.string({ message: "Time slot is required" }).trim().min(1, "Time slot cannot be empty"),
    contactNumber: z4.string({ message: "Contact number is required" }).trim().min(1, "Contact number cannot be empty")
  }).strict()
});
var cancelBookingValidationSchema = z4.object({
  body: z4.object({
    reason: z4.string({ message: "Cancellation reason is required" }).trim().min(1, "Cancellation reason cannot be empty")
  }).strict()
});
var BookingValidations = {
  createBookingValidationSchema,
  cancelBookingValidationSchema
};

// src/modules/booking/booking.route.ts
var router3 = express3.Router();
router3.post(
  "/",
  auth("CUSTOMER"),
  validateRequest_default(BookingValidations.createBookingValidationSchema),
  BookingControllers.createBooking
);
router3.get(
  "/",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  validateQuery_default(paginationQuerySchema),
  BookingControllers.getAllBookings
);
router3.get(
  "/:id",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  validateParams_default(idParamValidationSchema),
  BookingControllers.getBookingById
);
router3.patch(
  "/:id/cancel",
  auth("CUSTOMER"),
  validateParams_default(idParamValidationSchema),
  validateRequest_default(BookingValidations.cancelBookingValidationSchema),
  BookingControllers.cancelBooking
);
var BookingRoutes = router3;

// src/modules/payment/payment.route.ts
import express4 from "express";

// src/modules/payment/payment.service.ts
var createCheckoutSession = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, payment: true }
  });
  if (!booking) {
    throw new AppError_default(404, "Booking not found!");
  }
  if (booking.customerId !== userId) {
    throw new AppError_default(403, "You are not authorized to pay for this booking!");
  }
  if (booking.status !== "ACCEPTED") {
    throw new AppError_default(400, "Booking must be accepted before payment!");
  }
  if (booking.payment && booking.payment.status === "COMPLETED") {
    throw new AppError_default(400, "This booking has already been paid!");
  }
  const session = await stripe_default.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: booking.service.title,
            description: booking.service.description
          },
          unit_amount: Math.round(booking.servicePrice * 100)
        },
        quantity: 1
      }
    ],
    success_url: `${config_default.frontendUrl}/payment/success?bookingId=${booking.id}`,
    cancel_url: `${config_default.frontendUrl}/payment/cancel?bookingId=${booking.id}`,
    metadata: {
      bookingId: booking.id,
      customerId: userId
    }
  });
  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      amount: booking.servicePrice,
      transactionId: session.id,
      provider: "STRIPE",
      status: "PENDING",
      stripeCheckoutSessionId: session.id
    },
    update: {
      amount: booking.servicePrice,
      transactionId: session.id,
      provider: "STRIPE",
      status: "PENDING",
      stripeCheckoutSessionId: session.id,
      paidAt: null
    }
  });
  return { url: session.url, sessionId: session.id };
};
var getUserPaymentHistory = async (userId, role) => {
  const where = {};
  if (role === "CUSTOMER") {
    where.booking = { customerId: userId };
  }
  const result = await prisma.payment.findMany({
    where,
    include: {
      booking: {
        include: {
          service: true,
          customer: { select: { name: true, email: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var getPaymentById = async (paymentId, userId, role) => {
  const result = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          service: true,
          customer: { select: { name: true, email: true } }
        }
      }
    }
  });
  if (!result) {
    throw new AppError_default(404, "Payment not found!");
  }
  if (role === "CUSTOMER" && result.booking.customerId !== userId) {
    throw new AppError_default(403, "You are not authorized to view this payment details");
  }
  return result;
};
var markBookingPaid = async (session) => {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;
  if (session.payment_status !== "paid") return;
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const amount = (session.amount_total ?? 0) / 100;
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId }
  });
  if (existingPayment && existingPayment.status === "COMPLETED") {
    return;
  }
  await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      amount,
      transactionId: paymentIntentId ?? session.id,
      provider: "STRIPE",
      status: "COMPLETED",
      stripeCheckoutSessionId: session.id,
      paidAt: /* @__PURE__ */ new Date()
    },
    update: {
      amount,
      transactionId: paymentIntentId ?? session.id,
      provider: "STRIPE",
      status: "COMPLETED",
      stripeCheckoutSessionId: session.id,
      paidAt: /* @__PURE__ */ new Date()
    }
  });
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "PAID" }
  });
};
var handleCheckoutSessionFailed = async (session) => {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId }
  });
  if (!existingPayment || existingPayment.status === "COMPLETED") {
    return;
  }
  await prisma.payment.update({
    where: { bookingId },
    data: { status: "FAILED" }
  });
};
var handleChargeRefunded = async (charge) => {
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return;
  const payment = await prisma.payment.findUnique({
    where: { transactionId: paymentIntentId }
  });
  if (!payment || payment.status === "REFUNDED") return;
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "REFUNDED" }
  });
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "CANCELLED" }
  });
};
var handleStripeEvent = async (event) => {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await markBookingPaid(event.data.object);
      break;
    case "checkout.session.async_payment_failed":
      await handleCheckoutSessionFailed(event.data.object);
      break;
    case "charge.refunded":
      await handleChargeRefunded(event.data.object);
      break;
    default:
      break;
  }
};
var PaymentServices = {
  createCheckoutSession,
  getUserPaymentHistory,
  getPaymentById,
  handleStripeEvent
};

// src/modules/payment/payment.controller.ts
var createCheckoutSession2 = catchAsync_default(async (req, res) => {
  const result = await PaymentServices.createCheckoutSession(
    req.body.bookingId,
    req.user.id
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "Stripe Checkout session created successfully!",
    data: result
  });
});
var getUserPaymentHistory2 = catchAsync_default(async (req, res) => {
  const result = await PaymentServices.getUserPaymentHistory(
    req.user.id,
    req.user.role
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "Payment history retrieved successfully!",
    data: result
  });
});
var getPaymentById2 = catchAsync_default(async (req, res) => {
  const result = await PaymentServices.getPaymentById(
    req.params.id,
    req.user.id,
    req.user.role
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "Payment details retrieved successfully!",
    data: result
  });
});
var stripeWebhook = catchAsync_default(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const endpointSecret = config_default.stripe.webhookSecret;
  if (!signature || Array.isArray(signature)) {
    throw new AppError_default(400, "Missing or invalid Stripe signature header");
  }
  let event;
  try {
    event = stripe_default.webhooks.constructEvent(
      req.body,
      signature,
      endpointSecret
    );
  } catch (err) {
    throw new AppError_default(400, `Webhook signature verification failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  await PaymentServices.handleStripeEvent(event);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Webhook received successfully!",
    data: null
  });
});
var PaymentControllers = {
  createCheckoutSession: createCheckoutSession2,
  getUserPaymentHistory: getUserPaymentHistory2,
  getPaymentById: getPaymentById2,
  stripeWebhook
};

// src/modules/payment/payment.validation.ts
import { z as z5 } from "zod";
var createCheckoutSessionValidationSchema = z5.object({
  body: z5.object({
    bookingId: z5.string({ message: "Booking ID is required" }).uuid({ message: "Invalid Booking ID format" })
  }).strict()
});
var PaymentValidations = {
  createCheckoutSessionValidationSchema
};

// src/modules/payment/payment.route.ts
var router4 = express4.Router();
router4.post(
  "/checkout",
  auth("CUSTOMER"),
  validateRequest_default(PaymentValidations.createCheckoutSessionValidationSchema),
  PaymentControllers.createCheckoutSession
);
router4.get(
  "/",
  auth("CUSTOMER", "ADMIN"),
  validateQuery_default(paginationQuerySchema),
  PaymentControllers.getUserPaymentHistory
);
router4.get(
  "/:id",
  auth("CUSTOMER", "ADMIN"),
  validateParams_default(idParamValidationSchema),
  PaymentControllers.getPaymentById
);
var PaymentRoutes = router4;

// src/modules/technician/technician.route.ts
import express5 from "express";

// src/modules/technician/technician.service.ts
var getTechnicianBookings = async (userId) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId }
  });
  if (!technicianProfile) {
    throw new AppError_default(404, "Technician profile not found!");
  }
  const result = await prisma.booking.findMany({
    where: { technicianProfileId: technicianProfile.id },
    include: {
      service: true,
      customer: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var updateBookingStatus = async (bookingId, userId, status) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });
  if (!booking) {
    throw new AppError_default(404, "Booking not found!");
  }
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId }
  });
  if (!technicianProfile) {
    throw new AppError_default(404, "Technician profile not found!");
  }
  if (booking.technicianProfileId !== technicianProfile.id) {
    throw new AppError_default(403, "You are not authorized to update this booking!");
  }
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status }
  });
  const result = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: { select: { name: true, email: true } }
    }
  });
  return result;
};
var updateProfile3 = async (userId, payload) => {
  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: payload
  });
  return result;
};
var updateAvailability = async (userId, availabilityData) => {
  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: { availability: availabilityData }
  });
  return result;
};
var getAllTechnicians = async (query) => {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(query);
  const where = {
    user: { status: "ACTIVE" }
  };
  if (query.location) {
    where.location = { contains: query.location, mode: "insensitive" };
  }
  if (query.minRating) {
    where.averageRating = { gte: parseFloat(query.minRating) };
  }
  if (query.minHourlyRate || query.maxHourlyRate) {
    where.hourlyRate = {};
    if (query.minHourlyRate) where.hourlyRate.gte = parseFloat(query.minHourlyRate);
    if (query.maxHourlyRate) where.hourlyRate.lte = parseFloat(query.maxHourlyRate);
  }
  const [data, total] = await Promise.all([
    prisma.technicianProfile.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: { select: { name: true, email: true, status: true } }
      }
    }),
    prisma.technicianProfile.count({ where })
  ]);
  return { data, meta: buildMeta(page, limit, total) };
};
var getTechnicianById = async (id) => {
  const result = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      services: true,
      reviews: {
        include: {
          customer: { select: { name: true } }
        }
      }
    }
  });
  if (!result) {
    throw new AppError_default(404, "Technician not found!");
  }
  return result;
};
var applyForTechnician = async (userId, payload) => {
  const existingProfile = await prisma.technicianProfile.findUnique({
    where: { userId }
  });
  if (existingProfile) {
    if (existingProfile.approvalStatus === "APPROVED") {
      throw new AppError_default(400, "You are already an approved technician!");
    }
    if (existingProfile.approvalStatus === "PENDING") {
      throw new AppError_default(400, "Your application is already pending admin review!");
    }
    const updated = await prisma.technicianProfile.update({
      where: { userId },
      data: {
        bio: payload.bio,
        skills: payload.skills,
        experience: payload.experience,
        hourlyRate: payload.hourlyRate,
        location: payload.location,
        availability: payload.availability || {},
        approvalStatus: "PENDING",
        isVerified: false
      }
    });
    return updated;
  }
  const created = await prisma.technicianProfile.create({
    data: {
      userId,
      bio: payload.bio,
      skills: payload.skills,
      experience: payload.experience,
      hourlyRate: payload.hourlyRate,
      location: payload.location,
      availability: payload.availability || {},
      approvalStatus: "PENDING",
      isVerified: false
    }
  });
  return created;
};
var getApplicationStatus = async (userId) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    }
  });
  return profile;
};
var TechnicianServices = {
  getTechnicianBookings,
  updateBookingStatus,
  updateProfile: updateProfile3,
  updateAvailability,
  getAllTechnicians,
  getTechnicianById,
  applyForTechnician,
  getApplicationStatus
};

// src/modules/technician/technician.controller.ts
var getTechnicianBookings2 = catchAsync_default(async (req, res) => {
  const result = await TechnicianServices.getTechnicianBookings(req.user.id);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Technician bookings retrieved successfully!",
    data: result
  });
});
var updateBookingStatus2 = catchAsync_default(async (req, res) => {
  const result = await TechnicianServices.updateBookingStatus(
    req.params.id,
    req.user.id,
    req.body.status
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "Booking status updated successfully!",
    data: result
  });
});
var updateProfile4 = catchAsync_default(async (req, res) => {
  const result = await TechnicianServices.updateProfile(req.user.id, req.body);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Profile updated successfully!",
    data: result
  });
});
var updateAvailability2 = catchAsync_default(async (req, res) => {
  const result = await TechnicianServices.updateAvailability(
    req.user.id,
    req.body.availability
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "Availability updated successfully!",
    data: result
  });
});
var getAllTechnicians2 = catchAsync_default(async (req, res) => {
  const { data, meta } = await TechnicianServices.getAllTechnicians(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Technicians retrieved successfully!",
    meta,
    data
  });
});
var getTechnicianById2 = catchAsync_default(async (req, res) => {
  const result = await TechnicianServices.getTechnicianById(req.params.id);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Technician retrieved successfully!",
    data: result
  });
});
var applyForTechnician2 = catchAsync_default(async (req, res) => {
  const result = await TechnicianServices.applyForTechnician(req.user.id, req.body);
  sendResponse_default(res, {
    statusCode: 201,
    message: "Technician application submitted successfully!",
    data: result
  });
});
var getApplicationStatus2 = catchAsync_default(async (req, res) => {
  const result = await TechnicianServices.getApplicationStatus(req.user.id);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Application status retrieved successfully!",
    data: result
  });
});
var TechnicianControllers = {
  getTechnicianBookings: getTechnicianBookings2,
  updateBookingStatus: updateBookingStatus2,
  updateProfile: updateProfile4,
  updateAvailability: updateAvailability2,
  getAllTechnicians: getAllTechnicians2,
  getTechnicianById: getTechnicianById2,
  applyForTechnician: applyForTechnician2,
  getApplicationStatus: getApplicationStatus2
};

// src/modules/technician/technician.validation.ts
import { z as z6 } from "zod";
var updateBookingStatusValidationSchema = z6.object({
  body: z6.object({
    status: z6.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"], {
      message: "Invalid status"
    })
  }).strict()
});
var updateProfileValidationSchema2 = z6.object({
  body: z6.object({
    bio: z6.string({ message: "Bio must be a string" }).trim().min(1, "Bio cannot be empty").optional(),
    skills: z6.array(
      z6.string({ message: "Skill must be a string" }).trim().min(1, "Skill cannot be empty")
    ).min(1, "Skills array must contain at least one skill").optional(),
    experience: z6.number({ message: "Experience must be a number" }).int("Experience must be an integer").nonnegative("Experience cannot be negative").optional(),
    hourlyRate: z6.number({ message: "Hourly rate must be a number" }).nonnegative("Hourly rate must be a positive number").optional(),
    location: z6.string({ message: "Location must be a string" }).trim().min(1, "Location cannot be empty").optional()
  }).strict()
});
var updateAvailabilityValidationSchema = z6.object({
  body: z6.object({
    availability: z6.record(z6.string(), z6.array(z6.string().trim().min(1)))
  }).strict()
});
var applyTechnicianValidationSchema = z6.object({
  body: z6.object({
    bio: z6.string().trim().min(5, "Bio must be at least 5 characters"),
    skills: z6.array(z6.string().trim().min(1)).min(1, "At least one skill is required"),
    experience: z6.number().nonnegative("Experience must be a positive number"),
    hourlyRate: z6.number().positive("Hourly rate must be greater than 0"),
    location: z6.string().trim().min(2, "Location is required"),
    availability: z6.record(z6.string(), z6.array(z6.string())).optional()
  }).passthrough()
});
var TechnicianValidations = {
  updateBookingStatusValidationSchema,
  updateProfileValidationSchema: updateProfileValidationSchema2,
  updateAvailabilityValidationSchema,
  applyTechnicianValidationSchema
};

// src/modules/technician/technician.route.ts
var router5 = express5.Router();
router5.post(
  "/apply",
  auth("CUSTOMER", "TECHNICIAN"),
  validateRequest_default(TechnicianValidations.applyTechnicianValidationSchema),
  TechnicianControllers.applyForTechnician
);
router5.get(
  "/application-status",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  TechnicianControllers.getApplicationStatus
);
router5.get(
  "/bookings",
  auth("TECHNICIAN"),
  validateQuery_default(paginationQuerySchema),
  TechnicianControllers.getTechnicianBookings
);
router5.patch(
  "/bookings/:id",
  auth("TECHNICIAN"),
  validateParams_default(idParamValidationSchema),
  validateRequest_default(TechnicianValidations.updateBookingStatusValidationSchema),
  TechnicianControllers.updateBookingStatus
);
router5.put(
  "/profile",
  auth("TECHNICIAN"),
  validateRequest_default(TechnicianValidations.updateProfileValidationSchema),
  TechnicianControllers.updateProfile
);
router5.put(
  "/availability",
  auth("TECHNICIAN"),
  validateRequest_default(TechnicianValidations.updateAvailabilityValidationSchema),
  TechnicianControllers.updateAvailability
);
var listingRouter = express5.Router();
listingRouter.get(
  "/",
  validateQuery_default(paginationQuerySchema),
  TechnicianControllers.getAllTechnicians
);
listingRouter.get(
  "/:id",
  validateParams_default(idParamValidationSchema),
  TechnicianControllers.getTechnicianById
);
var TechnicianRoutes = router5;
var TechnicianListingRoutes = listingRouter;

// src/modules/review/review.route.ts
import express6 from "express";

// src/modules/review/review.service.ts
var createReview = async (customerId, payload) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId }
  });
  if (!booking) {
    throw new AppError_default(404, "Booking not found!");
  }
  if (booking.customerId !== customerId) {
    throw new AppError_default(403, "You are not authorized to review this booking!");
  }
  if (booking.status !== "COMPLETED" && booking.status !== "PAID") {
    throw new AppError_default(400, "You can only leave a review after the job is completed or paid.");
  }
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: payload.bookingId }
  });
  if (existingReview) {
    throw new AppError_default(409, "Review already exists for this booking!");
  }
  const technicianProfileId = booking.technicianProfileId;
  const created = await prisma.review.create({
    data: {
      bookingId: payload.bookingId,
      customerId,
      technicianProfileId,
      rating: payload.rating,
      comment: payload.comment
    }
  });
  const review = await prisma.review.findUnique({
    where: { id: created.id },
    include: {
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } }
    }
  });
  if (technicianProfileId) {
    const reviews = await prisma.review.findMany({
      where: { technicianProfileId },
      select: { rating: true }
    });
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    await prisma.technicianProfile.update({
      where: { id: technicianProfileId },
      data: { totalReviews, averageRating }
    });
  }
  return review;
};
var getMyReviews = async (userId, role) => {
  const where = {};
  if (role === "CUSTOMER") {
    where.customerId = userId;
  } else if (role === "TECHNICIAN") {
    where.technicianProfile = { userId };
  }
  const reviews = await prisma.review.findMany({
    where,
    include: {
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
      booking: { include: { service: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  return reviews;
};
var getTopReviews = async (limit = 6) => {
  const reviews = await prisma.review.findMany({
    where: {
      rating: { gte: 4 }
    },
    include: {
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
      booking: { include: { service: { select: { title: true } } } }
    },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: limit
  });
  return reviews;
};
var ReviewServices = {
  createReview,
  getMyReviews,
  getTopReviews
};

// src/modules/review/review.controller.ts
var createReview2 = catchAsync_default(async (req, res) => {
  const result = await ReviewServices.createReview(req.user.id, req.body);
  sendResponse_default(res, {
    statusCode: 201,
    message: "Review created successfully!",
    data: result
  });
});
var getMyReviews2 = catchAsync_default(async (req, res) => {
  const result = await ReviewServices.getMyReviews(req.user.id, req.user.role);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Reviews retrieved successfully!",
    data: result
  });
});
var getTopReviews2 = catchAsync_default(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 6;
  const result = await ReviewServices.getTopReviews(limit);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Top reviews retrieved successfully!",
    data: result
  });
});
var ReviewControllers = {
  createReview: createReview2,
  getMyReviews: getMyReviews2,
  getTopReviews: getTopReviews2
};

// src/modules/review/review.validation.ts
import { z as z7 } from "zod";
var createReviewValidationSchema = z7.object({
  body: z7.object({
    bookingId: z7.string({ message: "Booking ID is required" }).uuid({ message: "Invalid Booking ID format" }),
    rating: z7.number({ message: "Rating is required" }).int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    comment: z7.string({ message: "Comment must be a string" }).trim().min(1, "Comment cannot be empty").optional()
  }).strict()
});
var ReviewValidations = {
  createReviewValidationSchema
};

// src/modules/review/review.route.ts
var router6 = express6.Router();
router6.get("/top", ReviewControllers.getTopReviews);
router6.get(
  "/",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  ReviewControllers.getMyReviews
);
router6.post(
  "/",
  auth("CUSTOMER"),
  validateRequest_default(ReviewValidations.createReviewValidationSchema),
  ReviewControllers.createReview
);
var ReviewRoutes = router6;

// src/modules/admin/admin.route.ts
import express7 from "express";

// src/modules/admin/admin.service.ts
var getAllUsers = async (query) => {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(query);
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      omit: { password: true },
      include: { technicianProfile: true }
    }),
    prisma.user.count()
  ]);
  return { data, meta: buildMeta(page, limit, total) };
};
var toggleUserStatus = async (userId, status) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError_default(404, "User not found!");
  }
  const result = await prisma.user.update({
    where: { id: userId },
    data: { status },
    omit: { password: true }
  });
  return result;
};
var getAllBookings3 = async (query) => {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(query);
  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        service: true,
        customer: { select: { name: true, email: true } },
        technicianProfile: { include: { user: { select: { name: true } } } }
      }
    }),
    prisma.booking.count()
  ]);
  return { data, meta: buildMeta(page, limit, total) };
};
var getBookingById3 = async (bookingId) => {
  const result = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
      payment: true,
      review: true
    }
  });
  if (!result) {
    throw new AppError_default(404, "Booking not found!");
  }
  return result;
};
var getAllPayments = async () => {
  const result = await prisma.payment.findMany({
    include: {
      booking: {
        include: {
          service: true,
          customer: { select: { name: true, email: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var getPaymentById3 = async (paymentId) => {
  const result = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          service: true,
          customer: { select: { name: true, email: true } }
        }
      }
    }
  });
  if (!result) {
    throw new AppError_default(404, "Payment not found!");
  }
  return result;
};
var getAllReviews = async () => {
  const result = await prisma.review.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true, email: true } } } },
      booking: { include: { service: { select: { title: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var deleteReviewById = async (reviewId) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    throw new AppError_default(404, "Review not found!");
  }
  const result = await prisma.review.delete({
    where: { id: reviewId }
  });
  return result;
};
var getTechnicianApplications = async () => {
  const result = await prisma.technicianProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var reviewTechnicianApplication = async (profileId, approvalStatus) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { id: profileId }
  });
  if (!profile) {
    throw new AppError_default(404, "Technician application profile not found!");
  }
  const isApproved = approvalStatus === "APPROVED";
  const newRole = isApproved ? "TECHNICIAN" : "CUSTOMER";
  await prisma.user.update({
    where: { id: profile.userId },
    data: { role: newRole }
  });
  await prisma.technicianProfile.update({
    where: { id: profileId },
    data: {
      approvalStatus,
      isVerified: isApproved
    }
  });
  const updatedProfile = await prisma.technicianProfile.findUnique({
    where: { id: profileId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    }
  });
  return updatedProfile;
};
var AdminServices = {
  getAllUsers,
  toggleUserStatus,
  getAllBookings: getAllBookings3,
  getBookingById: getBookingById3,
  getAllPayments,
  getPaymentById: getPaymentById3,
  getAllReviews,
  deleteReviewById,
  getTechnicianApplications,
  reviewTechnicianApplication
};

// src/modules/admin/admin.controller.ts
var getAllUsers2 = catchAsync_default(async (req, res) => {
  const { data, meta } = await AdminServices.getAllUsers(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Users retrieved successfully!",
    meta,
    data
  });
});
var toggleUserStatus2 = catchAsync_default(async (req, res) => {
  const result = await AdminServices.toggleUserStatus(
    req.params.id,
    req.body.status
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "User status updated successfully!",
    data: result
  });
});
var getAllBookings4 = catchAsync_default(async (req, res) => {
  const { data, meta } = await AdminServices.getAllBookings(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Bookings retrieved successfully!",
    meta,
    data
  });
});
var getBookingById4 = catchAsync_default(async (req, res) => {
  const result = await AdminServices.getBookingById(req.params.id);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Booking retrieved successfully!",
    data: result
  });
});
var getAllPayments2 = catchAsync_default(async (_req, res) => {
  const result = await AdminServices.getAllPayments();
  sendResponse_default(res, {
    statusCode: 200,
    message: "Payments retrieved successfully!",
    data: result
  });
});
var getPaymentById4 = catchAsync_default(async (req, res) => {
  const result = await AdminServices.getPaymentById(req.params.id);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Payment retrieved successfully!",
    data: result
  });
});
var getAllReviews2 = catchAsync_default(async (_req, res) => {
  const result = await AdminServices.getAllReviews();
  sendResponse_default(res, {
    statusCode: 200,
    message: "Reviews retrieved successfully!",
    data: result
  });
});
var deleteReviewById2 = catchAsync_default(async (req, res) => {
  const result = await AdminServices.deleteReviewById(req.params.id);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Review deleted successfully!",
    data: result
  });
});
var getTechnicianApplications2 = catchAsync_default(async (_req, res) => {
  const result = await AdminServices.getTechnicianApplications();
  sendResponse_default(res, {
    statusCode: 200,
    message: "Technician applications retrieved successfully!",
    data: result
  });
});
var reviewTechnicianApplication2 = catchAsync_default(async (req, res) => {
  const result = await AdminServices.reviewTechnicianApplication(
    req.params.id,
    req.body.status
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: `Technician application ${req.body.status.toLowerCase()} successfully!`,
    data: result
  });
});
var AdminControllers = {
  getAllUsers: getAllUsers2,
  toggleUserStatus: toggleUserStatus2,
  getAllBookings: getAllBookings4,
  getBookingById: getBookingById4,
  getAllPayments: getAllPayments2,
  getPaymentById: getPaymentById4,
  getAllReviews: getAllReviews2,
  deleteReviewById: deleteReviewById2,
  getTechnicianApplications: getTechnicianApplications2,
  reviewTechnicianApplication: reviewTechnicianApplication2
};

// src/modules/admin/admin.validation.ts
import { z as z8 } from "zod";
var toggleUserStatusValidationSchema = z8.object({
  body: z8.object({
    status: z8.enum(["ACTIVE", "BANNED"], { message: "Invalid status" })
  }).strict()
});
var AdminValidations = {
  toggleUserStatusValidationSchema
};

// src/modules/admin/admin.route.ts
var router7 = express7.Router();
router7.get(
  "/users",
  auth("ADMIN"),
  validateQuery_default(paginationQuerySchema),
  AdminControllers.getAllUsers
);
router7.patch(
  "/users/:id",
  auth("ADMIN"),
  validateParams_default(idParamValidationSchema),
  validateRequest_default(AdminValidations.toggleUserStatusValidationSchema),
  AdminControllers.toggleUserStatus
);
router7.get(
  "/bookings",
  auth("ADMIN"),
  validateQuery_default(paginationQuerySchema),
  AdminControllers.getAllBookings
);
router7.get(
  "/bookings/:id",
  auth("ADMIN"),
  validateParams_default(idParamValidationSchema),
  AdminControllers.getBookingById
);
router7.get(
  "/payments",
  auth("ADMIN"),
  validateQuery_default(paginationQuerySchema),
  AdminControllers.getAllPayments
);
router7.get(
  "/payments/:id",
  auth("ADMIN"),
  validateParams_default(idParamValidationSchema),
  AdminControllers.getPaymentById
);
router7.get(
  "/reviews",
  auth("ADMIN"),
  AdminControllers.getAllReviews
);
router7.delete(
  "/reviews/:id",
  auth("ADMIN"),
  validateParams_default(idParamValidationSchema),
  AdminControllers.deleteReviewById
);
router7.get(
  "/technician-applications",
  auth("ADMIN"),
  AdminControllers.getTechnicianApplications
);
router7.patch(
  "/technician-applications/:id",
  auth("ADMIN"),
  validateParams_default(idParamValidationSchema),
  AdminControllers.reviewTechnicianApplication
);
var AdminRoutes = router7;

// src/modules/category/category.route.ts
import express8 from "express";

// src/modules/category/category.service.ts
var getAllCategoriesAdmin = async () => {
  const result = await prisma.category.findMany({
    include: { _count: { select: { services: true } } },
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var createCategory = async (payload) => {
  const existing = await prisma.category.findFirst({
    where: { name: payload.name }
  });
  if (existing) {
    throw new AppError_default(409, "Category with this name already exists!");
  }
  const result = await prisma.category.create({
    data: payload
  });
  return result;
};
var updateCategory = async (categoryId, payload) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (!category) {
    throw new AppError_default(404, "Category not found!");
  }
  if (payload.name && payload.name !== category.name) {
    const existing = await prisma.category.findFirst({
      where: { name: payload.name }
    });
    if (existing) {
      throw new AppError_default(409, "Category with this name already exists!");
    }
  }
  const result = await prisma.category.update({
    where: { id: categoryId },
    data: payload,
    include: { _count: { select: { services: true } } }
  });
  return result;
};
var deleteCategory = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { services: true } } }
  });
  if (!category) {
    throw new AppError_default(404, "Category not found!");
  }
  if (category._count.services > 0) {
    throw new AppError_default(
      400,
      "Cannot delete a category that has services assigned to it!"
    );
  }
  const result = await prisma.category.delete({
    where: { id: categoryId }
  });
  return result;
};
var CategoryServices = {
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory
};

// src/modules/category/category.controller.ts
var getAllCategoriesAdmin2 = catchAsync_default(async (_req, res) => {
  const result = await CategoryServices.getAllCategoriesAdmin();
  sendResponse_default(res, {
    statusCode: 200,
    message: "Categories retrieved successfully!",
    data: result
  });
});
var createCategory2 = catchAsync_default(async (req, res) => {
  const result = await CategoryServices.createCategory(req.body);
  sendResponse_default(res, {
    statusCode: 201,
    message: "Category created successfully!",
    data: result
  });
});
var updateCategory2 = catchAsync_default(async (req, res) => {
  const result = await CategoryServices.updateCategory(
    req.params.id,
    req.body
  );
  sendResponse_default(res, {
    statusCode: 200,
    message: "Category updated successfully!",
    data: result
  });
});
var deleteCategory2 = catchAsync_default(async (req, res) => {
  await CategoryServices.deleteCategory(req.params.id);
  sendResponse_default(res, {
    statusCode: 200,
    message: "Category deleted successfully!",
    data: null
  });
});
var CategoryControllers = {
  getAllCategoriesAdmin: getAllCategoriesAdmin2,
  createCategory: createCategory2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2
};

// src/modules/category/category.validation.ts
import { z as z9 } from "zod";
var createCategoryValidationSchema = z9.object({
  body: z9.object({
    name: z9.string({ message: "Category name is required" }).trim().min(1, "Category name cannot be empty"),
    description: z9.string({ message: "Description string is required" }).trim().min(1, "Description cannot be empty").optional()
  }).strict()
});
var updateCategoryValidationSchema = z9.object({
  body: z9.object({
    name: z9.string({ message: "Category name must be a string" }).trim().min(1, "Category name cannot be empty").optional(),
    description: z9.string({ message: "Description must be a string" }).trim().min(1, "Description cannot be empty").optional()
  }).strict()
});
var CategoryValidations = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema
};

// src/modules/category/category.route.ts
var router8 = express8.Router();
router8.get(
  "/",
  auth("ADMIN"),
  validateQuery_default(paginationQuerySchema),
  CategoryControllers.getAllCategoriesAdmin
);
router8.post(
  "/",
  auth("ADMIN"),
  validateRequest_default(CategoryValidations.createCategoryValidationSchema),
  CategoryControllers.createCategory
);
router8.patch(
  "/:id",
  auth("ADMIN"),
  validateParams_default(idParamValidationSchema),
  validateRequest_default(CategoryValidations.updateCategoryValidationSchema),
  CategoryControllers.updateCategory
);
router8.delete(
  "/:id",
  auth("ADMIN"),
  validateParams_default(idParamValidationSchema),
  CategoryControllers.deleteCategory
);
var CategoryRoutes = router8;

// src/middlewares/globalErrorHandler.ts
import { ZodError as ZodError4 } from "zod";
import { Prisma } from "@prisma/client";
var handleZodError = (err) => {
  const errorSources = err.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
  return { statusCode: 400, message: "Validation error", errorSources };
};
var handlePrismaError = (err) => {
  let statusCode = 500;
  let message = "Database error";
  const errorSources = [];
  switch (err.code) {
    case "P2002": {
      statusCode = 409;
      const metaTarget = err.meta?.target;
      const target = Array.isArray(metaTarget) ? metaTarget[0] : "";
      const field = target || "field";
      message = `A record with this ${field} already exists`;
      errorSources.push({ path: field, message });
      break;
    }
    case "P2025": {
      statusCode = 404;
      const metaCause = err.meta?.cause;
      message = typeof metaCause === "string" ? metaCause : "Record not found";
      errorSources.push({ path: "", message });
      break;
    }
    default:
      errorSources.push({ path: "", message: err.message });
  }
  return { statusCode, message, errorSources };
};
var globalErrorHandler = (err, _req, res, _next) => {
  let statusCode = typeof err?.statusCode === "number" ? err.statusCode : typeof err?.status === "number" ? err.status : 500;
  let message = "Internal server error";
  let errorSources = [
    {
      path: "",
      message: err instanceof Error ? err.message : "Something went wrong"
    }
  ];
  if (err instanceof ZodError4) {
    ({ statusCode, message, errorSources } = handleZodError(err));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    ({ statusCode, message, errorSources } = handlePrismaError(err));
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  }
  let stack;
  if (config_default.nodeEnv === "development" && err instanceof Error) {
    stack = err.stack;
  }
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

// src/config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
var options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FixItNow API",
      version: "1.0.0",
      description: "API documentation for FixItNow"
    },
    servers: [
      {
        url: config_default.backendUrl || `http://localhost:${config_default.port}`,
        description: "API Server"
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken"
        }
      }
    },
    security: [
      {
        cookieAuth: []
      }
    ]
  },
  apis: ["./src/modules/**/*.route.ts", "./src/app.ts"]
};
var swaggerSpec = swaggerJsdoc(options);

// src/app.ts
var app = express9();
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      withCredentials: true
    }
  })
);
app.use(
  "/api/payments/webhook",
  express9.raw({ type: "application/json" }),
  PaymentControllers.stripeWebhook
);
var allowedOrigins = [
  config_default.frontendUrl,
  config_default.backendUrl,
  process.env.FRONTEND_URL
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);
app.use(helmet());
app.use(express9.json({ limit: "10mb" }));
app.use(express9.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Database is connected" });
});
app.use("/api/auth", AuthRoutes);
app.use("/api/services/technicians", TechnicianListingRoutes);
app.use("/api/services", ServiceRoutes);
app.use("/api/bookings", BookingRoutes);
app.use("/api/payments", PaymentRoutes);
app.use("/api/technician", TechnicianRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/admin/categories", CategoryRoutes);
app.use((req, _res, next) => {
  next(new AppError_default(404, `Route not found: ${req.originalUrl}`));
});
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
app_default.listen(config_default.port, () => {
  console.log(`Server running on http://localhost:${config_default.port}/api/health`);
});
