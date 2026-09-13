import { describe, expect, it } from "vitest";

import {
  getDefaultTaskFormValues,
  RECURRENCE_PRESETS,
  validateTaskFormValues,
} from "@/components/tasks/task-form-rules";

const VALID_FORM_VALUES = {
  name: "Clean gutters",
  lastCompletedDate: "2026-09-13",
  recurrenceIntervalDays: "30",
};

describe("task form rules", () => {
  it("defaults last completed to today and leaves user-entered fields blank", () => {
    expect(getDefaultTaskFormValues("2026-09-13")).toEqual({
      name: "",
      lastCompletedDate: "2026-09-13",
      recurrenceIntervalDays: "",
    });
  });

  it("offers day-based recurrence presets", () => {
    expect(RECURRENCE_PRESETS).toEqual([
      { label: "1 month", days: 30 },
      { label: "3 months", days: 90 },
      { label: "1 year", days: 365 },
    ]);
  });

  it("accepts valid task form values", () => {
    expect(validateTaskFormValues(VALID_FORM_VALUES, "2026-09-13")).toEqual({});
  });

  it.each([
    {
      name: "blank name",
      values: { name: "   " },
      expectedErrors: { name: "Enter a task name." },
    },
    {
      name: "invalid calendar date",
      values: { lastCompletedDate: "2026-02-31" },
      expectedErrors: { lastCompletedDate: "Use a valid last completed date." },
    },
    {
      name: "future last completed date",
      values: { lastCompletedDate: "2026-09-14" },
      expectedErrors: { lastCompletedDate: "Last completed cannot be in the future." },
    },
    {
      name: "blank recurrence",
      values: { recurrenceIntervalDays: "   " },
      expectedErrors: { recurrenceIntervalDays: "Enter a repeat interval in days." },
    },
    {
      name: "nonnumeric recurrence",
      values: { recurrenceIntervalDays: "not-a-number" },
      expectedErrors: { recurrenceIntervalDays: "Repeat interval must be a number of days." },
    },
    {
      name: "zero recurrence",
      values: { recurrenceIntervalDays: "0" },
      expectedErrors: { recurrenceIntervalDays: "Repeat interval must be at least 1 day." },
    },
    {
      name: "decimal recurrence",
      values: { recurrenceIntervalDays: "1.5" },
      expectedErrors: { recurrenceIntervalDays: "Repeat interval must be a whole number of days." },
    },
  ])("rejects $name", ({ values, expectedErrors }) => {
    expect(validateTaskFormValues({ ...VALID_FORM_VALUES, ...values }, "2026-09-13")).toEqual(expectedErrors);
  });
});
