import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { EducationLevel, TodayVisitorsData, Visitor } from "../types";
import { dateOnly, todayInMuseumTimezone, toHourMinute } from "./dates";

const EDUCATION_LEVELS: EducationLevel[] = ["Mahasiswa", "Pelajar", "Umum"];

type VisitRow = Prisma.VisitGetPayload<object>;

export function toVisitor(visit: VisitRow): Visitor {
  return {
    id: visit.id,
    name: visit.visitorName,
    domicile: visit.domicile,
    institution: visit.institution,
    educationLevel: visit.educationLevel,
    checkInTime: toHourMinute(visit.checkInTime),
  };
}

/** Today's check-ins, earliest first. Optional `query` matches name, domicile, institution or education level. */
export async function getTodayVisitors(query?: string): Promise<TodayVisitorsData> {
  const today = todayInMuseumTimezone();
  const needle = query?.trim();

  const search: Prisma.VisitWhereInput[] = needle
    ? [
        { visitorName: { contains: needle } },
        { domicile: { contains: needle } },
        { institution: { contains: needle } },
        { educationLevel: { in: EDUCATION_LEVELS.filter((level) => level.toLowerCase().includes(needle.toLowerCase())) } },
      ]
    : [];

  const visits = await prisma.visit.findMany({
    where: { visitDate: dateOnly(today), ...(search.length > 0 ? { OR: search } : {}) },
    orderBy: [{ checkInTime: "asc" }, { id: "asc" }],
  });

  return { date: today, visitors: visits.map(toVisitor) };
}
