import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";

const createBooking = async (
  customerId: string,
  payload: {
    serviceId: string;
    technicianProfileId: string;
    scheduledDate: string;
    timeSlot: string;
    contactNumber: string;
  }
) => {
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
  });

  if (!service) {
    throw new AppError(404, "Service not found!");
  }

  const result = await prisma.booking.create({
    data: {
      customerId,
      serviceId: payload.serviceId,
      technicianProfileId: payload.technicianProfileId,
      servicePrice: service.price,
      contactNumber: payload.contactNumber,
      scheduledDate: new Date(payload.scheduledDate),
      timeSlot: payload.timeSlot,
      status: "REQUESTED",
    },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
    },
  });

  return result;
};

const getAllBookings = async (userId: string, role: string) => {
  let where: any = {};

  if (role === "CUSTOMER") {
    where.customerId = userId;
  } else if (role === "TECHNICIAN") {
    where.technicianProfile = { userId };
  }

  const result = await prisma.booking.findMany({
    where,
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
    },
  });

  return result;
};

const getBookingById = async (bookingId: string, userId: string, role: string) => {
  const result = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
    },
  });

  if (!result) {
    throw new AppError(404, "Booking not found!");
  }

  const isOwner =
    role === "ADMIN" ||
    result.customerId === userId ||
    result.technicianProfile.userId === userId;

  if (!isOwner) {
    throw new AppError(403, "You are not authorized to view this booking!");
  }

  return result;
};

export const BookingServices = {
  createBooking,
  getAllBookings,
  getBookingById,
};
