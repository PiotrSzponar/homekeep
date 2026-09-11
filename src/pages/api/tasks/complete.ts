import type { APIRoute } from "astro";

import { formatUtcDateOnly } from "@/lib/maintenance-tasks";
import { type MaintenanceTaskSupabaseClient, updateMaintenanceTask } from "@/lib/maintenance-task-store";
import { createClient } from "@/lib/supabase";

const DASHBOARD_PATH = "/dashboard";
const GENERIC_COMPLETION_ERROR = "Unable to complete task.";

export const POST: APIRoute = async (context) => {
  const userId = context.locals.user?.id;

  if (!userId) {
    return context.redirect("/auth/signin");
  }

  const supabase = createClient(context.request.headers, context.cookies);

  if (!supabase) {
    return redirectWithTaskError(context);
  }

  const form = await context.request.formData();
  const taskId = stringFormValue(form, "taskId").trim();

  if (!taskId) {
    return redirectWithTaskError(context);
  }

  const result = await updateMaintenanceTask(supabase as MaintenanceTaskSupabaseClient, userId, taskId, {
    lastCompletedDate: formatUtcDateOnly(),
  });

  if (result.error) {
    return redirectWithTaskError(context);
  }

  return context.redirect(`${DASHBOARD_PATH}?taskCompleted=1`);
};

function stringFormValue(form: FormData, fieldName: string): string {
  const value = form.get(fieldName);

  return typeof value === "string" ? value : "";
}

function redirectWithTaskError(context: Parameters<APIRoute>[0]): Response {
  return context.redirect(`${DASHBOARD_PATH}?taskError=${encodeURIComponent(GENERIC_COMPLETION_ERROR)}`);
}
