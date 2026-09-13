import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateMaintenanceTask } from "@/lib/maintenance-task-store";
import { createClient } from "@/lib/supabase";
import { parseMaintenanceTaskUpdateForm, POST } from "@/pages/api/tasks/update";

vi.mock("@/lib/maintenance-task-store", () => ({
  updateMaintenanceTask: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  createClient: vi.fn(),
}));

const mockUpdateMaintenanceTask = vi.mocked(updateMaintenanceTask);
const mockCreateClient = vi.mocked(createClient);

describe("task update route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockReturnValue({ from: vi.fn() } as never);
    mockUpdateMaintenanceTask.mockResolvedValue({
      data: {
        id: "task-1",
        user_id: "user-1",
        name: "Clean gutters",
        last_completed_date: "2026-09-10",
        recurrence_interval_days: 90,
        created_at: "2026-09-01T00:00:00.000Z",
        updated_at: "2026-09-10T00:00:00.000Z",
      },
      error: null,
    });
  });

  it("updates the signed-in user's task with the submitted edit payload", async () => {
    const response = await POST(
      createRouteContext({
        userId: "user-1",
        form: updateFormData({
          taskId: "task-1",
          name: "  Clean gutters  ",
          lastCompletedDate: "2026-09-10",
          recurrenceIntervalDays: "90",
        }),
      }),
    );

    expect(mockUpdateMaintenanceTask).toHaveBeenCalledWith(expect.anything(), "user-1", "task-1", {
      name: "Clean gutters",
      lastCompletedDate: "2026-09-10",
      recurrenceIntervalDays: 90,
    });
    expect(response.headers.get("Location")).toBe("/dashboard?taskUpdated=1");
  });

  it("redirects with a generic task error when the task id is missing", async () => {
    const response = await POST(
      createRouteContext({
        userId: "user-1",
        form: updateFormData({ taskId: "" }),
      }),
    );

    expect(mockUpdateMaintenanceTask).not.toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/dashboard?taskError=Unable%20to%20update%20task.");
  });

  it("redirects to sign in when the user is unauthenticated", async () => {
    const response = await POST(
      createRouteContext({
        userId: null,
        form: updateFormData(),
      }),
    );

    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(mockUpdateMaintenanceTask).not.toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/auth/signin");
  });

  it("redirects with a generic task error when the store update fails", async () => {
    mockUpdateMaintenanceTask.mockResolvedValueOnce({
      data: null,
      error: { message: "No rows returned" },
    });

    const response = await POST(
      createRouteContext({
        userId: "user-1",
        form: updateFormData(),
      }),
    );

    expect(response.headers.get("Location")).toBe("/dashboard?taskError=Unable%20to%20update%20task.");
  });

  it("rejects blank recurrence values before building a full edit input", () => {
    expect(parseMaintenanceTaskUpdateForm(updateFormData({ recurrenceIntervalDays: "" }))).toBeNull();
  });

  it("rejects non-numeric recurrence values before building a full edit input", () => {
    expect(parseMaintenanceTaskUpdateForm(updateFormData({ recurrenceIntervalDays: "not-a-number" }))).toBeNull();
  });
});

function updateFormData(
  overrides: Partial<Record<"taskId" | "name" | "lastCompletedDate" | "recurrenceIntervalDays", string>> = {},
): FormData {
  const form = new FormData();
  form.set("taskId", overrides.taskId ?? "task-1");
  form.set("name", overrides.name ?? "Clean gutters");
  form.set("lastCompletedDate", overrides.lastCompletedDate ?? "2026-09-10");
  form.set("recurrenceIntervalDays", overrides.recurrenceIntervalDays ?? "90");

  return form;
}

function createRouteContext({ userId, form }: { userId: string | null; form: FormData }): Parameters<typeof POST>[0] {
  return {
    locals: {
      user: userId ? { id: userId } : null,
    },
    request: new Request("https://homekeep.test/api/tasks/update", {
      method: "POST",
      body: form,
    }),
    cookies: {},
    redirect: (path: string) => new Response(null, { status: 302, headers: { Location: path } }),
  } as unknown as Parameters<typeof POST>[0];
}
