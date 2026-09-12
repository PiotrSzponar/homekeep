import { describe, expect, it } from "vitest";

import {
  classifyMaintenanceTaskStatus,
  computeNextDueDate,
  deriveMaintenanceTaskState,
  formatUtcDateOnly,
  type MaintenanceTaskRow,
  toMaintenanceTaskDisplayItems,
  validateMaintenanceTaskUpdateInput,
  validateMaintenanceTaskWriteInput,
} from "@/lib/maintenance-tasks";

describe("maintenance task contract", () => {
  it("computes the next due date from the last completed date plus recurrence days", () => {
    expect(computeNextDueDate("2026-09-01", 30)).toBe("2026-10-01");
  });

  it("formats the app date as a UTC date-only value", () => {
    expect(formatUtcDateOnly(new Date("2026-09-11T23:59:59.000Z"))).toBe("2026-09-11");
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

  it("accepts and normalizes a full maintenance task update input", () => {
    expect(
      validateMaintenanceTaskUpdateInput({
        name: "  Replace HVAC filter  ",
        lastCompletedDate: "2026-09-01",
        recurrenceIntervalDays: 30,
      }),
    ).toEqual({
      success: true,
      data: {
        name: "Replace HVAC filter",
        lastCompletedDate: "2026-09-01",
        recurrenceIntervalDays: 30,
      },
    });
  });

  it("rejects invalid date-only values in update input", () => {
    expect(
      validateMaintenanceTaskUpdateInput({
        lastCompletedDate: "2026-99-99",
      }),
    ).toEqual({
      success: false,
      errors: {
        lastCompletedDate: "Last completed date must use YYYY-MM-DD format.",
      },
    });
  });

  it("rejects non-positive recurrence intervals in update input", () => {
    expect(
      validateMaintenanceTaskUpdateInput({
        recurrenceIntervalDays: -1,
      }),
    ).toEqual({
      success: false,
      errors: {
        recurrenceIntervalDays: "Recurrence interval must be a positive whole number of days.",
      },
    });
  });

  it("rejects empty update input", () => {
    expect(validateMaintenanceTaskUpdateInput({})).toEqual({
      success: false,
      errors: {
        name: "At least one task field must be provided.",
      },
    });
  });

  it("maps stored task rows into display items with calculated state", () => {
    expect(toMaintenanceTaskDisplayItems([taskRow({ last_completed_date: "2026-09-01" })], "2026-09-08")).toEqual([
      {
        id: "task-1",
        name: "Task 1",
        lastCompletedDate: "2026-09-01",
        recurrenceIntervalDays: 14,
        nextDueDate: "2026-09-15",
        status: "due-soon",
      },
    ]);
  });

  it("sorts display items by overdue, due soon, ok, then earliest next due date", () => {
    const displayItems = toMaintenanceTaskDisplayItems(
      [
        taskRow({
          id: "ok-earlier",
          name: "OK earlier",
          last_completed_date: "2026-09-01",
          recurrence_interval_days: 20,
        }),
        taskRow({
          id: "due-soon-later",
          name: "Due soon later",
          last_completed_date: "2026-09-01",
          recurrence_interval_days: 7,
        }),
        taskRow({
          id: "overdue",
          name: "Overdue",
          last_completed_date: "2026-08-01",
          recurrence_interval_days: 30,
        }),
        taskRow({
          id: "due-soon-earlier",
          name: "Due soon earlier",
          last_completed_date: "2026-09-01",
          recurrence_interval_days: 3,
        }),
        taskRow({
          id: "ok-later",
          name: "OK later",
          last_completed_date: "2026-09-01",
          recurrence_interval_days: 30,
        }),
      ],
      "2026-09-01",
    );

    expect(displayItems.map((task) => task.id)).toEqual([
      "overdue",
      "due-soon-earlier",
      "due-soon-later",
      "ok-earlier",
      "ok-later",
    ]);
  });
});

function taskRow(overrides: Partial<MaintenanceTaskRow> = {}): MaintenanceTaskRow {
  return {
    id: "task-1",
    user_id: "user-1",
    name: "Task 1",
    last_completed_date: "2026-09-01",
    recurrence_interval_days: 14,
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}
