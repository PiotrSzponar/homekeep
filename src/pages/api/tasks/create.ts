import type { APIRoute } from "astro";

import type { MaintenanceTaskWriteInput } from "@/lib/maintenance-tasks";
import { createMaintenanceTask, type MaintenanceTaskSupabaseClient } from "@/lib/maintenance-task-store";
import { createClient } from "@/lib/supabase";

const DASHBOARD_PATH = "/dashboard";

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
  const input = toMaintenanceTaskWriteInput(form);

  const result = await createMaintenanceTask(supabase as MaintenanceTaskSupabaseClient, userId, input);

  if (result.error) {
    return redirectWithTaskError(context, result.error.message);
  }

  return context.redirect(`${DASHBOARD_PATH}?taskCreated=1`);
};

function toMaintenanceTaskWriteInput(form: FormData): MaintenanceTaskWriteInput {
  const name = stringFormValue(form, "name").trim();
  const lastCompletedDate = stringFormValue(form, "lastCompletedDate");
  const recurrenceIntervalDays = Number(stringFormValue(form, "recurrenceIntervalDays"));

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
