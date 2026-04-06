import { Case } from "../models/Case.js";
import { Task } from "../models/Task.js";

export type DashboardSummary = {
  activeCases: number;
  hearingsNext7Days: number;
  tasksPending: number;
  tasksCompleted: number;
};

function utcStartOfCalendarDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  );
}

function addUtcCalendarDays(start: Date, days: number): Date {
  return new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate() + days,
      0,
      0,
      0,
      0
    )
  );
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const startOfTodayUtc = utcStartOfCalendarDay(now);
  const endExclusive = addUtcCalendarDays(startOfTodayUtc, 7);

  const [activeCases, hearingsNext7Days, tasksPending, tasksCompleted] =
    await Promise.all([
      Case.countDocuments({}),
      Case.countDocuments({
        nextHearingDate: { $gte: startOfTodayUtc, $lt: endExclusive },
      }),
      Task.countDocuments({ status: "Pending" }),
      Task.countDocuments({ status: "Completed" }),
    ]);

  return {
    activeCases,
    hearingsNext7Days,
    tasksPending,
    tasksCompleted,
  };
}
