import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import config from "../../config";
import { Prisma, Role } from "../../../generated/prisma/client";

const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) => {
  const isUserExists = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExists) {
    throw new AppError(409, "User already exists with this email!");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: payload.role,
      },
    });

    if (payload.role === "TECHNICIAN") {
      await tx.technicianProfile.create({
        data: {
          userId: newUser.id,
          experience: 0,
          hourlyRate: 0,
          location: "",
          availability: {},
        },
      });
    }

    return tx.user.findUnique({
      where: { id: newUser.id },
      omit: { password: true },
      include: { technicianProfile: payload.role === "TECHNICIAN" },
    });
  });

  return result;
};

const loginUser = async (payload: { email: string; password: string }) => {
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

  const jwtPayload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(
    jwtPayload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    jwtPayload,
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
  );

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

export const AuthServices = {
  registerUser,
  loginUser,
  getMe,
};
