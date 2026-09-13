import type { APIRoute } from "astro";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMaintenanceTask } from "@/lib/maintenance-task-store";
import { createClient } from "@/lib/supabase";
import { parseMaintenanceTaskCreateForm, POST } from "@/pages/api/tasks/create";

vi.mock("@/lib/maintenance-task-store", () => ({
  createMaintenanceTask: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  createClient: vi.fn(),
}));

const mockCreateMaintenanceTask = vi.mocked(createMaintenanceTask);
const mockCreateClient = vi.mocked(createClient);

describe("task create route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockReturnValue({ from: vi.fn() } as never);
    mockCreateMaintenanceTask.mockResolvedValue({
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

  it("creates a signed-in user's task with the submitted payload", async () => {
    const response = await POST(
      createRouteContext({
        userId: "user-1",
        form: createFormData({
          name: "  Clean gutters  ",
          lastCompletedDate: "2026-09-10",
          recurrenceIntervalDays: "90",
        }),
      }),
    );

    expect(mockCreateMaintenanceTask).toHaveBeenCalledWith(expect.anything(), "user-1", {
      name: "Clean gutters",
      lastCompletedDate: "2026-09-10",
      recurrenceIntervalDays: 90,
    });
    expect(response.headers.get("Location")).toBe("/dashboard?taskCreated=1");
  });

  it("redirects with a task error when required parser input is missing", async () => {
    const response = await POST(
      createRouteContext({
        userId: "user-1",
        form: createFormData({ name: "" }),
      }),
    );

    expect(mockCreateMaintenanceTask).not.toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/dashboard?taskError=Unable%20to%20create%20task.");
  });

  it("redirects to sign in when the user is unauthenticated", async () => {
    const response = await POST(
      createRouteContext({
        userId: null,
        form: createFormData(),
      }),
    );

    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(mockCreateMaintenanceTask).not.toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/auth/signin");
  });

  it("redirects to sign in when Supabase is not configured", async () => {
    mockCreateClient.mockReturnValueOnce(null);

    const response = await POST(
      createRouteContext({
        userId: "user-1",
        form: createFormData(),
      }),
    );

    expect(mockCreateMaintenanceTask).not.toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/auth/signin");
  });

  it("redirects with the store error message when the store create fails", async () => {
    mockCreateMaintenanceTask.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid maintenance task input." },
    });

    const response = await POST(
      createRouteContext({
        userId: "user-1",
        form: createFormData({ lastCompletedDate: "2026-09-14" }),
      }),
    );

    expect(response.headers.get("Location")).toBe("/dashboard?taskError=Invalid%20maintenance%20task%20input.");
  });

  it("parses a complete create form", () => {
    expect(parseMaintenanceTaskCreateForm(createFormData({ recurrenceIntervalDays: "90" }))).toEqual({
      name: "Clean gutters",
      lastCompletedDate: "2026-09-10",
      recurrenceIntervalDays: 90,
    });
  });

  it("rejects blank create parser values before building a full input", () => {
    expect(parseMaintenanceTaskCreateForm(createFormData({ name: "" }))).toBeNull();
    expect(parseMaintenanceTaskCreateForm(createFormData({ lastCompletedDate: "" }))).toBeNull();
    expect(parseMaintenanceTaskCreateForm(createFormData({ recurrenceIntervalDays: "" }))).toBeNull();
  });

  it("rejects non-numeric create recurrence values before building a full input", () => {
    expect(parseMaintenanceTaskCreateForm(createFormData({ recurrenceIntervalDays: "not-a-number" }))).toBeNull();
  });
});

function createFormData(
  overrides: Partial<Record<"name" | "lastCompletedDate" | "recurrenceIntervalDays", string>> = {},
): FormData {
  const form = new FormData();
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
    request: new Request("https://homekeep.test/api/tasks/create", {
      method: "POST",
      body: form,
    }),
    cookies: {},
    redirect: (path: string) => new Response(null, { status: 302, headers: { Location: path } }),
  } as unknown as Parameters<APIRoute>[0];
}
