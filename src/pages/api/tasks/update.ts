import type { APIRoute } from "astro";

import type { MaintenanceTaskWriteInput } from "@/lib/maintenance-tasks";
import { type MaintenanceTaskSupabaseClient, updateMaintenanceTask } from "@/lib/maintenance-task-store";
import { createClient } from "@/lib/supabase";

const DASHBOARD_PATH = "/dashboard";
const GENERIC_UPDATE_ERROR = "Unable to update task.";

interface ParsedMaintenanceTaskUpdateForm {
  taskId: string;
  input: MaintenanceTaskWriteInput;
}

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
  const parsedForm = parseMaintenanceTaskUpdateForm(form);

  if (!parsedForm) {
    return redirectWithTaskError(context);
  }

  const result = await updateMaintenanceTask(
    supabase as MaintenanceTaskSupabaseClient,
    userId,
    parsedForm.taskId,
    parsedForm.input,
  );

  if (result.error) {
    return redirectWithTaskError(context);
  }

  return context.redirect(`${DASHBOARD_PATH}?taskUpdated=1`);
};

export function parseMaintenanceTaskUpdateForm(form: FormData): ParsedMaintenanceTaskUpdateForm | null {
  const taskId = stringFormValue(form, "taskId").trim();
  const name = stringFormValue(form, "name").trim();
  const lastCompletedDate = stringFormValue(form, "lastCompletedDate");
  const recurrenceIntervalDaysValue = stringFormValue(form, "recurrenceIntervalDays").trim();

  if (!taskId || !name || !lastCompletedDate || !recurrenceIntervalDaysValue) {
    return null;
  }

  return {
    taskId,
    input: {
      name,
      lastCompletedDate,
      recurrenceIntervalDays: Number(recurrenceIntervalDaysValue),
    },
  };
}

function stringFormValue(form: FormData, fieldName: string): string {
  const value = form.get(fieldName);

  return typeof value === "string" ? value : "";
}

function redirectWithTaskError(context: Parameters<APIRoute>[0]): Response {
  return context.redirect(`${DASHBOARD_PATH}?taskError=${encodeURIComponent(GENERIC_UPDATE_ERROR)}`);
}
