type PaginationQuery = {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

const parsePagination = (query: PaginationQuery) => {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = (query.sortOrder === "asc" ? "asc" : "desc") as "asc" | "desc";

  return { page, limit, skip, take: limit, sortBy, sortOrder };
};

const buildMeta = (page: number, limit: number, total: number): PaginationMeta => ({
  page,
  limit,
  total,
  totalPage: Math.ceil(total / limit),
});

export { parsePagination, buildMeta };
export type { PaginationQuery, PaginationMeta };
