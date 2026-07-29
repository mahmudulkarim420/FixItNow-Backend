import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import config from "../../config";
import { Prisma } from "../../../generated/prisma/client";
import type { JwtPayload } from "../../interfaces/payloads";
import type { TRegisterPayload, TLoginPayload } from "./auth.validation";

const registerUser = async (payload: TRegisterPayload) => {
  const isUserExists = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExists) {
    throw new AppError(409, "User already exists with this email!");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
    },
  });

  if (payload.role === "TECHNICIAN") {
    await prisma.technicianProfile.create({
      data: {
        userId: newUser.id,
        experience: 0,
        hourlyRate: 0,
        location: "",
        availability: {},
      },
    });
  }

  return prisma.user.findUnique({
    where: { id: newUser.id },
    omit: { password: true },
    include: { technicianProfile: payload.role === "TECHNICIAN" },
  });
};

const loginUser = async (payload: TLoginPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(404, "User not found!");
  }

  if (user.status === "BANNED") {
    throw new AppError(403, "This user account has been banned!");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid password!");
  }

  const jwtPayload: JwtPayload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(jwtPayload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(jwtPayload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

  const userWithoutPassword = await prisma.user.findUnique({
    where: { email: payload.email },
    omit: { password: true },
  });

  return { accessToken, refreshToken, user: userWithoutPassword };
};

const getMe = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });

  if (!result) {
    throw new AppError(404, "User not found!");
  }

  return result;
};

const refreshToken = async (token: string) => {
  let decoded: jwt.JwtPayload;

  try {
    decoded = jwt.verify(token, config.jwt.refreshSecret) as jwt.JwtPayload;
  } catch {
    throw new AppError(401, "Invalid or expired refresh token!");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    throw new AppError(404, "User not found!");
  }

  if (user.status === "BANNED") {
    throw new AppError(403, "This user account has been banned!");
  }

  const jwtPayload: JwtPayload = { id: user.id, email: user.email, role: user.role };

  const newAccessToken = jwt.sign(
    jwtPayload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );

  const newRefreshToken = jwt.sign(
    jwtPayload,
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const updateProfile = async (userId: string, payload: import("./auth.validation").TUpdateProfilePayload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { technicianProfile: true },
  });

  if (!user) {
    throw new AppError(404, "User not found!");
  }

  if (user.status === "BANNED") {
    throw new AppError(403, "This user account has been banned!");
  }

  if (payload.email && payload.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) {
      throw new AppError(409, "Email is already taken by another account!");
    }
  }

  const userDataToUpdate: Record<string, any> = {};
  if (payload.name) userDataToUpdate.name = payload.name;
  if (payload.email) userDataToUpdate.email = payload.email;
  if (payload.password) {
    userDataToUpdate.password = await bcrypt.hash(payload.password, 10);
  }

  const { bio, skills, experience, hourlyRate, location } = payload;
  const hasTechnicianData =
    bio !== undefined ||
    skills !== undefined ||
    experience !== undefined ||
    hourlyRate !== undefined ||
    location !== undefined;

  if (Object.keys(userDataToUpdate).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: userDataToUpdate,
    });
  }

  if (hasTechnicianData && user.role === "TECHNICIAN") {
    const techDataToUpdate: Record<string, any> = {};
    if (bio !== undefined) techDataToUpdate.bio = bio;
    if (skills !== undefined) techDataToUpdate.skills = skills;
    if (experience !== undefined) techDataToUpdate.experience = experience;
    if (hourlyRate !== undefined) techDataToUpdate.hourlyRate = hourlyRate;
    if (location !== undefined) techDataToUpdate.location = location;

    await prisma.technicianProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: bio || "",
        skills: skills || [],
        experience: experience || 0,
        hourlyRate: hourlyRate || 0,
        location: location || "",
      },
      update: techDataToUpdate,
    });
  }

  return prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
    include: { technicianProfile: true },
  });
};

const deleteProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found!");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return null;
};

export const AuthServices = {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  updateProfile,
  deleteProfile,
};
