import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";

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
  status: string
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

  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: status as any },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
    },
  });

  return result;
};

const updateProfile = async (
  userId: string,
  payload: {
    bio?: string;
    skills?: string[];
    experience?: number;
    hourlyRate?: number;
    location?: string;
  }
) => {
  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: payload,
  });

  return result;
};

const updateAvailability = async (userId: string, availabilityData: any) => {
  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: { availability: availabilityData },
  });

  return result;
};

export const TechnicianServices = {
  getTechnicianBookings,
  updateBookingStatus,
  updateProfile,
  updateAvailability,
};
