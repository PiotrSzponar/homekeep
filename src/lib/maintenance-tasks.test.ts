import { describe, expect, it } from "vitest";

import {
  classifyMaintenanceTaskStatus,
  computeNextDueDate,
  deriveMaintenanceTaskState,
  validateMaintenanceTaskWriteInput,
} from "@/lib/maintenance-tasks";

describe("maintenance task contract", () => {
  it("computes the next due date from the last completed date plus recurrence days", () => {
    expect(computeNextDueDate("2026-09-01", 30)).toBe("2026-10-01");
  });

  it("classifies a task as overdue after the next due date has passed", () => {
    expect(classifyMaintenanceTaskStatus("2026-09-10", "2026-09-11")).toBe("overdue");
  });

  it("classifies a task as due soon when the next due date is within 7 days", () => {
    expect(classifyMaintenanceTaskStatus("2026-09-18", "2026-09-11")).toBe("due-soon");
  });

  it("classifies a task as ok when the next due date is more than 7 days away", () => {
    expect(classifyMaintenanceTaskStatus("2026-09-19", "2026-09-11")).toBe("ok");
  });

  it("derives next due date and status without storing mutable derived fields", () => {
    expect(
      deriveMaintenanceTaskState(
        {
          last_completed_date: "2026-09-01",
          recurrence_interval_days: 14,
        },
        "2026-09-08",
      ),
    ).toEqual({
      nextDueDate: "2026-09-15",
      status: "due-soon",
    });
  });

  it("rejects invalid recurrence intervals at helper-level validation", () => {
    expect(
      validateMaintenanceTaskWriteInput({
        name: "Replace HVAC filter",
        lastCompletedDate: "2026-09-01",
        recurrenceIntervalDays: 0,
      }),
    ).toEqual({
      success: false,
      errors: {
        recurrenceIntervalDays: "Recurrence interval must be a positive whole number of days.",
      },
    });
  });
});
