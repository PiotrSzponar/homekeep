import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type MaintenanceTaskDatabase,
  type MaintenanceTaskInsert,
  type MaintenanceTaskRow,
  type MaintenanceTaskUpdate,
  type MaintenanceTaskUpdateInput,
  type MaintenanceTaskValidationErrors,
  type MaintenanceTaskWriteInput,
  validateMaintenanceTaskUpdateInput,
  validateMaintenanceTaskWriteInput,
} from "@/lib/maintenance-tasks";

export type MaintenanceTaskSupabaseClient = SupabaseClient<MaintenanceTaskDatabase>;

export interface MaintenanceTaskStoreError {
  message: string;
  fields?: MaintenanceTaskValidationErrors;
}

export type MaintenanceTaskStoreResult<TData> =
  { data: TData; error: null } | { data: null; error: MaintenanceTaskStoreError };

const TASK_COLUMNS = "id,user_id,name,last_completed_date,recurrence_interval_days,created_at,updated_at" as const;

export async function listMaintenanceTasks(
  supabase: MaintenanceTaskSupabaseClient,
  userId: string,
): Promise<MaintenanceTaskStoreResult<MaintenanceTaskRow[]>> {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(TASK_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data, error: null };
}

export async function createMaintenanceTask(
  supabase: MaintenanceTaskSupabaseClient,
  userId: string,
  input: MaintenanceTaskWriteInput,
): Promise<MaintenanceTaskStoreResult<MaintenanceTaskRow>> {
  const validation = validateMaintenanceTaskWriteInput(input);

  if (!validation.success) {
    return { data: null, error: { message: "Invalid maintenance task input.", fields: validation.errors } };
  }

  const insert: MaintenanceTaskInsert = {
    user_id: userId,
    name: validation.data.name,
    last_completed_date: validation.data.lastCompletedDate,
    recurrence_interval_days: validation.data.recurrenceIntervalDays,
  };

  const { data, error } = await supabase.from("maintenance_tasks").insert(insert).select(TASK_COLUMNS).single();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data, error: null };
}

export async function updateMaintenanceTask(
  supabase: MaintenanceTaskSupabaseClient,
  userId: string,
  taskId: string,
  input: MaintenanceTaskUpdateInput,
): Promise<MaintenanceTaskStoreResult<MaintenanceTaskRow>> {
  const validation = validateMaintenanceTaskUpdateInput(input);

  if (!validation.success) {
    return { data: null, error: { message: "Invalid maintenance task input.", fields: validation.errors } };
  }

  const update: MaintenanceTaskUpdate = {
    ...(validation.data.name === undefined ? {} : { name: validation.data.name }),
    ...(validation.data.lastCompletedDate === undefined
      ? {}
      : { last_completed_date: validation.data.lastCompletedDate }),
    ...(validation.data.recurrenceIntervalDays === undefined
      ? {}
      : { recurrence_interval_days: validation.data.recurrenceIntervalDays }),
  };

  const { data, error } = await supabase
    .from("maintenance_tasks")
    .update(update)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data, error: null };
}

export async function deleteMaintenanceTask(
  supabase: MaintenanceTaskSupabaseClient,
  userId: string,
  taskId: string,
): Promise<MaintenanceTaskStoreResult<null>> {
  const { error } = await supabase.from("maintenance_tasks").delete().eq("id", taskId).eq("user_id", userId);

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: null, error: null };
}
