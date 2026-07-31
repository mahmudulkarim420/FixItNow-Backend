import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { parsePagination, buildMeta } from "../../utils/pagination";
import { Prisma, Status } from "../../../generated/prisma/client";
import type { PaginationQuery } from "../../interfaces/payloads";

const getAllUsers = async (query: PaginationQuery) => {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(query);

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      orderBy: { [sortBy]: sortOrder } as Prisma.UserOrderByWithRelationInput,
      omit: { password: true },
      include: { technicianProfile: true },
    }),
    prisma.user.count(),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const toggleUserStatus = async (userId: string, status: Status) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, "User not found!");
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: { status },
    omit: { password: true },
  });

  return result;
};

const getAllBookings = async (query: PaginationQuery) => {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(query);

  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      skip,
      take,
      orderBy: { [sortBy]: sortOrder } as Prisma.BookingOrderByWithRelationInput,
      include: {
        service: true,
        customer: { select: { name: true, email: true } },
        technicianProfile: { include: { user: { select: { name: true } } } },
      },
    }),
    prisma.booking.count(),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
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

const getAllReviews = async () => {
  const result = await prisma.review.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true, email: true } } } },
      booking: { include: { service: { select: { title: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const deleteReviewById = async (reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    throw new AppError(404, "Review not found!");
  }

  const result = await prisma.review.delete({
    where: { id: reviewId },
  });

  return result;
};

const getTechnicianApplications = async () => {
  const result = await prisma.technicianProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const reviewTechnicianApplication = async (
  profileId: string,
  approvalStatus: "APPROVED" | "REJECTED"
) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    throw new AppError(404, "Technician application profile not found!");
  }

  const isApproved = approvalStatus === "APPROVED";
  const newRole = isApproved ? "TECHNICIAN" : "CUSTOMER";

  // 1. Update user role
  await prisma.user.update({
    where: { id: profile.userId },
    data: { role: newRole },
  });

  // 2. Update profile status and verification flag
  await prisma.technicianProfile.update({
    where: { id: profileId },
    data: {
      approvalStatus,
      isVerified: isApproved,
    },
  });

  // 3. Retrieve enriched result with user details
  const updatedProfile = await prisma.technicianProfile.findUnique({
    where: { id: profileId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return updatedProfile;
};

export const AdminServices = {
  getAllUsers,
  toggleUserStatus,
  getAllBookings,
  getBookingById,
  getAllPayments,
  getPaymentById,
  getAllReviews,
  deleteReviewById,
  getTechnicianApplications,
  reviewTechnicianApplication,
};


