export const DUE_SOON_THRESHOLD_DAYS = 7;

export const MAINTENANCE_TASK_STATUSES = {
  ok: "ok",
  dueSoon: "due-soon",
  overdue: "overdue",
} as const;

export type MaintenanceTaskStatus = (typeof MAINTENANCE_TASK_STATUSES)[keyof typeof MAINTENANCE_TASK_STATUSES];

export interface MaintenanceTaskRow {
  id: string;
  user_id: string;
  name: string;
  last_completed_date: string;
  recurrence_interval_days: number;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTaskInsert {
  user_id: string;
  name: string;
  last_completed_date: string;
  recurrence_interval_days: number;
  created_at?: string;
  updated_at?: string;
}

export type MaintenanceTaskUpdate = Partial<
  Pick<MaintenanceTaskRow, "name" | "last_completed_date" | "recurrence_interval_days" | "updated_at">
>;

export interface MaintenanceTaskWriteInput {
  name: string;
  lastCompletedDate: string;
  recurrenceIntervalDays: number;
}

export type MaintenanceTaskUpdateInput = Partial<MaintenanceTaskWriteInput>;

export type MaintenanceTaskValidationErrors = Partial<Record<keyof MaintenanceTaskWriteInput, string>>;

export type MaintenanceTaskValidationResult<TInput extends MaintenanceTaskUpdateInput> =
  { success: true; data: TInput } | { success: false; errors: MaintenanceTaskValidationErrors };

export interface MaintenanceTaskDerivedState {
  nextDueDate: string;
  status: MaintenanceTaskStatus;
}

export type MaintenanceTaskWithDerivedState = MaintenanceTaskRow & MaintenanceTaskDerivedState;

export interface MaintenanceTaskDisplayItem extends MaintenanceTaskDerivedState {
  id: string;
  name: string;
  lastCompletedDate: string;
  recurrenceIntervalDays: number;
}

export interface MaintenanceTaskDatabase {
  public: {
    Tables: {
      maintenance_tasks: {
        Row: MaintenanceTaskRow;
        Insert: MaintenanceTaskInsert;
        Update: MaintenanceTaskUpdate;
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeNextDueDate(lastCompletedDate: string, recurrenceIntervalDays: number): string {
  assertPositiveRecurrenceInterval(recurrenceIntervalDays);

  const completedAt = parseDateOnly(lastCompletedDate);
  completedAt.setUTCDate(completedAt.getUTCDate() + recurrenceIntervalDays);

  return formatDateOnly(completedAt);
}

export function classifyMaintenanceTaskStatus(
  nextDueDate: string,
  todayDate = formatDateOnly(new Date()),
): MaintenanceTaskStatus {
  const daysUntilDue = diffDateOnlyInDays(todayDate, nextDueDate);

  if (daysUntilDue < 0) {
    return MAINTENANCE_TASK_STATUSES.overdue;
  }

  if (daysUntilDue <= DUE_SOON_THRESHOLD_DAYS) {
    return MAINTENANCE_TASK_STATUSES.dueSoon;
  }

  return MAINTENANCE_TASK_STATUSES.ok;
}

export function deriveMaintenanceTaskState(
  task: Pick<MaintenanceTaskRow, "last_completed_date" | "recurrence_interval_days">,
  todayDate = formatDateOnly(new Date()),
): MaintenanceTaskDerivedState {
  const nextDueDate = computeNextDueDate(task.last_completed_date, task.recurrence_interval_days);

  return {
    nextDueDate,
    status: classifyMaintenanceTaskStatus(nextDueDate, todayDate),
  };
}

export function withMaintenanceTaskDerivedState(
  task: MaintenanceTaskRow,
  todayDate = formatDateOnly(new Date()),
): MaintenanceTaskWithDerivedState {
  return {
    ...task,
    ...deriveMaintenanceTaskState(task, todayDate),
  };
}

export function toMaintenanceTaskDisplayItems(
  tasks: MaintenanceTaskRow[],
  todayDate = formatDateOnly(new Date()),
): MaintenanceTaskDisplayItem[] {
  return tasks.map((task) => toMaintenanceTaskDisplayItem(task, todayDate)).sort(compareMaintenanceTaskDisplayItems);
}

function toMaintenanceTaskDisplayItem(task: MaintenanceTaskRow, todayDate: string): MaintenanceTaskDisplayItem {
  const derivedState = deriveMaintenanceTaskState(task, todayDate);

  return {
    id: task.id,
    name: task.name,
    lastCompletedDate: task.last_completed_date,
    recurrenceIntervalDays: task.recurrence_interval_days,
    nextDueDate: derivedState.nextDueDate,
    status: derivedState.status,
  };
}

function compareMaintenanceTaskDisplayItems(
  first: MaintenanceTaskDisplayItem,
  second: MaintenanceTaskDisplayItem,
): number {
  const statusDifference = statusSortOrder(first.status) - statusSortOrder(second.status);

  if (statusDifference !== 0) {
    return statusDifference;
  }

  const dateDifference = first.nextDueDate.localeCompare(second.nextDueDate);

  if (dateDifference !== 0) {
    return dateDifference;
  }

  return first.name.localeCompare(second.name);
}

function statusSortOrder(status: MaintenanceTaskStatus): number {
  switch (status) {
    case MAINTENANCE_TASK_STATUSES.overdue:
      return 0;
    case MAINTENANCE_TASK_STATUSES.dueSoon:
      return 1;
    case MAINTENANCE_TASK_STATUSES.ok:
      return 2;
  }
}

export function validateMaintenanceTaskWriteInput(
  input: MaintenanceTaskWriteInput,
): MaintenanceTaskValidationResult<MaintenanceTaskWriteInput> {
  const errors = validateMaintenanceTaskFields(input);

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name: input.name.trim(),
      lastCompletedDate: input.lastCompletedDate,
      recurrenceIntervalDays: input.recurrenceIntervalDays,
    },
  };
}

export function validateMaintenanceTaskUpdateInput(
  input: MaintenanceTaskUpdateInput,
): MaintenanceTaskValidationResult<MaintenanceTaskUpdateInput> {
  const errors = validateMaintenanceTaskFields(input);

  if (Object.keys(input).length === 0) {
    errors.name = "At least one task field must be provided.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      ...(input.name === undefined ? {} : { name: input.name.trim() }),
      ...(input.lastCompletedDate === undefined ? {} : { lastCompletedDate: input.lastCompletedDate }),
      ...(input.recurrenceIntervalDays === undefined ? {} : { recurrenceIntervalDays: input.recurrenceIntervalDays }),
    },
  };
}

function validateMaintenanceTaskFields(input: MaintenanceTaskUpdateInput): MaintenanceTaskValidationErrors {
  const errors: MaintenanceTaskValidationErrors = {};

  if (input.name?.trim().length === 0) {
    errors.name = "Task name is required.";
  }

  if (input.lastCompletedDate !== undefined && !isDateOnly(input.lastCompletedDate)) {
    errors.lastCompletedDate = "Last completed date must use YYYY-MM-DD format.";
  }

  if (input.recurrenceIntervalDays !== undefined && !isPositiveRecurrenceInterval(input.recurrenceIntervalDays)) {
    errors.recurrenceIntervalDays = "Recurrence interval must be a positive whole number of days.";
  }

  return errors;
}

function assertPositiveRecurrenceInterval(value: number): asserts value is number {
  if (!isPositiveRecurrenceInterval(value)) {
    throw new RangeError("Recurrence interval must be a positive whole number of days.");
  }
}

function isPositiveRecurrenceInterval(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function diffDateOnlyInDays(fromDate: string, toDate: string): number {
  return Math.round((parseDateOnly(toDate).getTime() - parseDateOnly(fromDate).getTime()) / MS_PER_DAY);
}

function parseDateOnly(date: string): Date {
  const match = DATE_ONLY_PATTERN.exec(date);

  if (!match) {
    throw new RangeError("Date must use YYYY-MM-DD format.");
  }

  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (formatDateOnly(parsed) !== date) {
    throw new RangeError("Date must be a valid calendar date.");
  }

  return parsed;
}

function isDateOnly(date: string): boolean {
  try {
    parseDateOnly(date);
    return true;
  } catch {
    return false;
  }
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
