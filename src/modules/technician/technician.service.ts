import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { parsePagination, buildMeta } from "../../utils/pagination";
import { Prisma, BookingStatus } from "@prisma/client";
import type { PaginationQuery } from "../../interfaces/payloads";
import type { TUpdateProfilePayload } from "./technician.validation";

const getTechnicianBookings = async (userId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new AppError(404, "Technician profile not found!");
  }

  const result = await prisma.booking.findMany({
    where: { technicianProfileId: technicianProfile.id },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const updateBookingStatus = async (
  bookingId: string,
  userId: string,
  status: BookingStatus
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found!");
  }

  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new AppError(404, "Technician profile not found!");
  }

  if (booking.technicianProfileId !== technicianProfile.id) {
    throw new AppError(403, "You are not authorized to update this booking!");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  const result = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
    },
  });

  return result;
};

const updateProfile = async (
  userId: string,
  payload: TUpdateProfilePayload
) => {
  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: payload,
  });

  return result;
};

const updateAvailability = async (userId: string, availabilityData: Prisma.InputJsonValue) => {
  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: { availability: availabilityData },
  });

  return result;
};

type TechnicianQuery = PaginationQuery & {
  location?: string;
  minRating?: string;
  minHourlyRate?: string;
  maxHourlyRate?: string;
};

const getAllTechnicians = async (query: TechnicianQuery) => {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(query);
  const where: Prisma.TechnicianProfileWhereInput = {
    user: { status: "ACTIVE" },
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
      orderBy: { [sortBy]: sortOrder } as Prisma.TechnicianProfileOrderByWithRelationInput,
      include: {
        user: { select: { name: true, email: true, status: true } },
      },
    }),
    prisma.technicianProfile.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getTechnicianById = async (id: string) => {
  const result = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      services: true,
      reviews: {
        include: {
          customer: { select: { name: true } },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(404, "Technician not found!");
  }

  return result;
};

const applyForTechnician = async (
  userId: string,
  payload: any
) => {
  const existingProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    if (existingProfile.approvalStatus === "APPROVED") {
      throw new AppError(400, "You are already an approved technician!");
    }
    if (existingProfile.approvalStatus === "PENDING") {
      throw new AppError(400, "Your application is already pending admin review!");
    }
    // If REJECTED, update the existing profile to PENDING
    const updated = await prisma.technicianProfile.update({
      where: { userId },
      data: {
        bio: payload.bio,
        skills: payload.skills,
        experience: payload.experience,
        hourlyRate: payload.hourlyRate,
        location: payload.location,
        availability: (payload.availability || {}) as Prisma.InputJsonValue,
        approvalStatus: "PENDING",
        isVerified: false,
      },
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
      availability: (payload.availability || {}) as Prisma.InputJsonValue,
      approvalStatus: "PENDING",
      isVerified: false,
    },
  });

  return created;
};

const getApplicationStatus = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return profile;
};

export const TechnicianServices = {
  getTechnicianBookings,
  updateBookingStatus,
  updateProfile,
  updateAvailability,
  getAllTechnicians,
  getTechnicianById,
  applyForTechnician,
  getApplicationStatus,
};

