import { describe, expect, it, vi } from "vitest";

import { deleteMaintenanceTask, type MaintenanceTaskSupabaseClient } from "@/lib/maintenance-task-store";

describe("maintenance task store", () => {
  it("treats a returned owned row as a successful deletion", async () => {
    const { query, supabase } = deleteClientResult({ data: [{ id: "task-1" }], error: null });

    await expect(deleteMaintenanceTask(supabase, "user-1", "task-1")).resolves.toEqual({ data: null, error: null });
    expect(query.eq).toHaveBeenNthCalledWith(1, "id", "task-1");
    expect(query.eq).toHaveBeenNthCalledWith(2, "user_id", "user-1");
    expect(query.select).toHaveBeenCalledWith("id");
  });

  it("returns a generic failure when no owned row matched the delete", async () => {
    const { supabase } = deleteClientResult({ data: [], error: null });

    await expect(deleteMaintenanceTask(supabase, "user-1", "stale-task")).resolves.toEqual({
      data: null,
      error: { message: "Unable to delete task." },
    });
  });

  it("returns the Supabase error when the delete fails", async () => {
    const { supabase } = deleteClientResult({ data: [], error: { message: "Database unavailable." } });

    await expect(deleteMaintenanceTask(supabase, "user-1", "task-1")).resolves.toEqual({
      data: null,
      error: { message: "Database unavailable." },
    });
  });
});

function deleteClientResult(result: { data: { id: string }[]; error: { message: string } | null }) {
  const query = {
    delete: vi.fn(() => query),
    eq: vi.fn(() => query),
    select: vi.fn(() => Promise.resolve(result)),
  };
  const supabase = {
    from: vi.fn(() => query),
  };

  return { query, supabase: supabase as unknown as MaintenanceTaskSupabaseClient };
}
