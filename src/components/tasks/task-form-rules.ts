export interface TaskFormValues {
  name: string;
  lastCompletedDate: string;
  recurrenceIntervalDays: string;
}

export type TaskFormField = keyof TaskFormValues;

export type TaskFormErrors = Partial<Record<TaskFormField, string>>;

export interface RecurrencePreset {
  label: string;
  days: number;
}

export const RECURRENCE_PRESETS: RecurrencePreset[] = [
  { label: "1 month", days: 30 },
  { label: "3 months", days: 90 },
  { label: "1 year", days: 365 },
];

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function getBrowserLocalTodayDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDefaultTaskFormValues(todayDate = getBrowserLocalTodayDate()): TaskFormValues {
  return {
    name: "",
    lastCompletedDate: todayDate,
    recurrenceIntervalDays: "",
  };
}

export function validateTaskFormValues(values: TaskFormValues, todayDate = getBrowserLocalTodayDate()): TaskFormErrors {
  const errors: TaskFormErrors = {};

  if (values.name.trim().length === 0) {
    errors.name = "Enter a task name.";
  }

  if (!values.lastCompletedDate) {
    errors.lastCompletedDate = "Choose the last completed date.";
  } else if (!isDateOnly(values.lastCompletedDate)) {
    errors.lastCompletedDate = "Use a valid last completed date.";
  } else if (values.lastCompletedDate > todayDate) {
    errors.lastCompletedDate = "Last completed cannot be in the future.";
  }

  const recurrenceValue = values.recurrenceIntervalDays.trim();

  if (!recurrenceValue) {
    errors.recurrenceIntervalDays = "Enter a repeat interval in days.";
  } else {
    const recurrenceIntervalDays = Number(recurrenceValue);

    if (!Number.isFinite(recurrenceIntervalDays)) {
      errors.recurrenceIntervalDays = "Repeat interval must be a number of days.";
    } else if (!Number.isInteger(recurrenceIntervalDays)) {
      errors.recurrenceIntervalDays = "Repeat interval must be a whole number of days.";
    } else if (recurrenceIntervalDays <= 0) {
      errors.recurrenceIntervalDays = "Repeat interval must be at least 1 day.";
    }
  }

  return errors;
}

export function hasTaskFormErrors(errors: TaskFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

function isDateOnly(date: string): boolean {
  const match = DATE_ONLY_PATTERN.exec(date);

  if (!match) {
    return false;
  }

  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return parsed.toISOString().slice(0, 10) === date;
}
