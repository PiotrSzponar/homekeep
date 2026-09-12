import type { APIRoute } from "astro";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteMaintenanceTask } from "@/lib/maintenance-task-store";
import { createClient } from "@/lib/supabase";
import { POST } from "@/pages/api/tasks/delete";

vi.mock("@/lib/supabase", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/maintenance-task-store", () => ({
  deleteMaintenanceTask: vi.fn(),
}));

const createClientMock = vi.mocked(createClient);
const deleteMaintenanceTaskMock = vi.mocked(deleteMaintenanceTask);
const supabase = { marker: "supabase" };

describe("delete task route", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    deleteMaintenanceTaskMock.mockReset();
    createClientMock.mockReturnValue(supabase as never);
    deleteMaintenanceTaskMock.mockResolvedValue({ data: null, error: null });
  });

  it("deletes a signed-in user's task and redirects with success feedback", async () => {
    const context = routeContext({ taskId: "task-1" });

    const response = await POST(context);

    expect(deleteMaintenanceTaskMock).toHaveBeenCalledWith(supabase, "user-1", "task-1");
    expect(response.headers.get("Location")).toBe("/dashboard?taskDeleted=1");
  });

  it("redirects signed-out users to sign in", async () => {
    const context = routeContext({ taskId: "task-1", userId: null });

    const response = await POST(context);

    expect(createClientMock).not.toHaveBeenCalled();
    expect(deleteMaintenanceTaskMock).not.toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/auth/signin");
  });

  it("redirects with a generic task error when Supabase is not configured", async () => {
    createClientMock.mockReturnValue(null);
    const context = routeContext({ taskId: "task-1" });

    const response = await POST(context);

    expect(deleteMaintenanceTaskMock).not.toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe(genericErrorRedirect());
  });

  it("redirects with a generic task error when the task id is missing", async () => {
    const context = routeContext({ taskId: null });

    const response = await POST(context);

    expect(deleteMaintenanceTaskMock).not.toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe(genericErrorRedirect());
  });

  it("redirects with a generic task error when the store delete fails", async () => {
    deleteMaintenanceTaskMock.mockResolvedValue({ data: null, error: { message: "Database unavailable." } });
    const context = routeContext({ taskId: "task-1" });

    const response = await POST(context);

    expect(response.headers.get("Location")).toBe(genericErrorRedirect());
  });

  it("redirects with a generic task error when no owned row was deleted", async () => {
    deleteMaintenanceTaskMock.mockResolvedValue({ data: null, error: { message: "Unable to delete task." } });
    const context = routeContext({ taskId: "foreign-or-stale-task" });

    const response = await POST(context);

    expect(deleteMaintenanceTaskMock).toHaveBeenCalledWith(supabase, "user-1", "foreign-or-stale-task");
    expect(response.headers.get("Location")).toBe(genericErrorRedirect());
  });
});

function routeContext({ taskId, userId = "user-1" }: { taskId: string | null; userId?: string | null }) {
  const form = new FormData();

  if (taskId !== null) {
    form.set("taskId", taskId);
  }

  return {
    cookies: {},
    locals: {
      user: userId ? { id: userId } : null,
    },
    redirect: (location: string) => new Response(null, { headers: { Location: location }, status: 302 }),
    request: new Request("http://localhost/api/tasks/delete", {
      body: form,
      method: "POST",
    }),
  } as unknown as Parameters<APIRoute>[0];
}

function genericErrorRedirect(): string {
  return `/dashboard?taskError=${encodeURIComponent("Unable to delete task.")}`;
}
