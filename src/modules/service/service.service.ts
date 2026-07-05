import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";

const getAllServices = async (query: {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
}) => {
  const where: any = {};

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
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

  const result = await prisma.service.findMany({
    where,
    include: {
      category: true,
      technicianProfile: {
        select: {
          id: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  return result;
};

const getAllTechnicians = async (query: {
  location?: string;
  minRating?: string;
  minHourlyRate?: string;
  maxHourlyRate?: string;
}) => {
  const where: any = {
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

  const result = await prisma.technicianProfile.findMany({
    where,
    include: {
      user: { select: { name: true, email: true, status: true } },
    },
  });

  return result;
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

export const ServiceServices = {
  getAllServices,
  getAllTechnicians,
  getTechnicianById,
};
