import type { APIRoute } from "astro";

import type { MaintenanceTaskWriteInput } from "@/lib/maintenance-tasks";
import { createMaintenanceTask, type MaintenanceTaskSupabaseClient } from "@/lib/maintenance-task-store";
import { createClient } from "@/lib/supabase";

const DASHBOARD_PATH = "/dashboard";
const GENERIC_CREATE_ERROR = "Unable to create task.";

export const POST: APIRoute = async (context) => {
  const userId = context.locals.user?.id;

  if (!userId) {
    return context.redirect("/auth/signin");
  }

  const supabase = createClient(context.request.headers, context.cookies);

  if (!supabase) {
    return context.redirect("/auth/signin");
  }

  const form = await context.request.formData();
  const input = parseMaintenanceTaskCreateForm(form);

  if (!input) {
    return redirectWithTaskError(context, GENERIC_CREATE_ERROR);
  }

  const result = await createMaintenanceTask(supabase as MaintenanceTaskSupabaseClient, userId, input);

  if (result.error) {
    return redirectWithTaskError(context, result.error.message);
  }

  return context.redirect(`${DASHBOARD_PATH}?taskCreated=1`);
};

export function parseMaintenanceTaskCreateForm(form: FormData): MaintenanceTaskWriteInput | null {
  const name = stringFormValue(form, "name").trim();
  const lastCompletedDate = stringFormValue(form, "lastCompletedDate");
  const recurrenceIntervalDaysValue = stringFormValue(form, "recurrenceIntervalDays").trim();
  const recurrenceIntervalDays = Number(recurrenceIntervalDaysValue);

  if (!name || !lastCompletedDate || !recurrenceIntervalDaysValue || !Number.isFinite(recurrenceIntervalDays)) {
    return null;
  }

  return {
    name,
    lastCompletedDate,
    recurrenceIntervalDays,
  };
}

function stringFormValue(form: FormData, fieldName: string): string {
  const value = form.get(fieldName);

  return typeof value === "string" ? value : "";
}

function redirectWithTaskError(context: Parameters<APIRoute>[0], message: string): Response {
  return context.redirect(`${DASHBOARD_PATH}?taskError=${encodeURIComponent(message)}`);
}
