// Model tabel `visits` (check-in pengunjung).

import type { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

export type VisitRecord = Prisma.VisitGetPayload<object>;

export const countVisitsOn = (visitDate: Date) => prisma.visit.count({ where: { visitDate } });

export const groupVisitsByDate = (from: Date, to: Date) =>
  prisma.visit.groupBy({ by: ["visitDate"], where: { visitDate: { gte: from, lte: to } }, _count: { _all: true } });

export const findLatestVisitDate = () => prisma.visit.aggregate({ _max: { visitDate: true } });

export const listCheckInTimes = (visitDate: Date) =>
  prisma.visit.findMany({ where: { visitDate }, select: { checkInTime: true } });

export const listRecentVisits = (visitDate: Date, take: number) =>
  prisma.visit.findMany({ where: { visitDate }, orderBy: [{ checkInTime: "desc" }, { id: "desc" }], take });

export const listVisitsOn = (visitDate: Date, search: Prisma.VisitWhereInput[]) =>
  prisma.visit.findMany({
    where: { visitDate, ...(search.length > 0 ? { OR: search } : {}) },
    orderBy: [{ checkInTime: "asc" }, { id: "asc" }],
  });

export const findVisit = (where: Prisma.VisitWhereInput) => prisma.visit.findFirst({ where });

export const insertVisit = (data: Prisma.VisitUncheckedCreateInput) => prisma.visit.create({ data });
