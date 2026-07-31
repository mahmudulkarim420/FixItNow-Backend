import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { TCreateReviewPayload } from "./review.validation";

const createReview = async (customerId: string, payload: TCreateReviewPayload) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found!");
  }

  if (booking.customerId !== customerId) {
    throw new AppError(403, "You are not authorized to review this booking!");
  }

  if (booking.status !== "COMPLETED" && booking.status !== "PAID") {
    throw new AppError(400, "You can only leave a review after the job is completed or paid.");
  }

  const existingReview = await prisma.review.findUnique({
    where: { bookingId: payload.bookingId },
  });

  if (existingReview) {
    throw new AppError(409, "Review already exists for this booking!");
  }

  const technicianProfileId = booking.technicianProfileId;

  const created = await prisma.review.create({
    data: {
      bookingId: payload.bookingId,
      customerId,
      technicianProfileId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  const review = await prisma.review.findUnique({
    where: { id: created.id },
    include: {
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
    },
  });

  if (technicianProfileId) {
    const reviews = await prisma.review.findMany({
      where: { technicianProfileId },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await prisma.technicianProfile.update({
      where: { id: technicianProfileId },
      data: { totalReviews, averageRating },
    });
  }

  return review;
};

const getMyReviews = async (userId: string, role: string) => {
  const where: any = {};
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
      booking: { include: { service: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

const getTopReviews = async (limit: number = 6) => {
  const reviews = await prisma.review.findMany({
    where: {
      rating: { gte: 4 },
    },
    include: {
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
      booking: { include: { service: { select: { title: true } } } },
    },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return reviews;
};

export const ReviewServices = {
  createReview,
  getMyReviews,
  getTopReviews,
};

