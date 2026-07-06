import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { Prisma, Status } from "../../../generated/prisma/client";

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    omit: { password: true },
    include: { technicianProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const toggleUserStatus = async (userId: string, status: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, "User not found!");
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: { status: status as Status },
    omit: { password: true },
  });

  return result;
};

const getAllBookings = async () => {
  const result = await prisma.booking.findMany({
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getBookingById = async (bookingId: string) => {
  const result = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
      payment: true,
      review: true,
    },
  });

  if (!result) {
    throw new AppError(404, "Booking not found!");
  }

  return result;
};

const getAllCategoriesAdmin = async () => {
  const result = await prisma.category.findMany({
    include: { _count: { select: { services: true } } },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const createCategory = async (payload: { name: string; description?: string }) => {
  const existing = await prisma.category.findFirst({
    where: { name: payload.name },
  });

  if (existing) {
    throw new AppError(409, "Category with this name already exists!");
  }

  const result = await prisma.category.create({
    data: payload,
  });

  return result;
};

const updateCategory = async (
  categoryId: string,
  payload: { name?: string; description?: string }
) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError(404, "Category not found!");
  }

  if (payload.name && payload.name !== category.name) {
    const existing = await prisma.category.findFirst({
      where: { name: payload.name },
    });

    if (existing) {
      throw new AppError(409, "Category with this name already exists!");
    }
  }

  const result = await prisma.category.update({
    where: { id: categoryId },
    data: payload,
    include: { _count: { select: { services: true } } },
  });

  return result;
};

const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { services: true } } },
  });

  if (!category) {
    throw new AppError(404, "Category not found!");
  }

  if (category._count.services > 0) {
    throw new AppError(
      400,
      "Cannot delete a category that has services assigned to it!"
    );
  }

  const result = await prisma.category.delete({
    where: { id: categoryId },
  });

  return result;
};

const getAllPayments = async () => {
  const result = await prisma.payment.findMany({
    include: {
      booking: {
        include: {
          service: true,
          customer: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getPaymentById = async (paymentId: string) => {
  const result = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          service: true,
          customer: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(404, "Payment not found!");
  }

  return result;
};

export const AdminServices = {
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
