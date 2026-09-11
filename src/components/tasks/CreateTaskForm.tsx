import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function CreateTaskForm() {
  return (
    <form method="POST" action="/api/tasks/create" className="mt-5 flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        Task name
        <input
          name="name"
          required
          maxLength={120}
          className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white transition-colors placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          placeholder="HVAC filter"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        Last completed
        <input
          type="date"
          name="lastCompletedDate"
          required
          className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white transition-colors focus:border-emerald-400 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        Repeat every
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="recurrenceIntervalDays"
            required
            min={1}
            step={1}
            inputMode="numeric"
            className="h-10 min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white transition-colors focus:border-emerald-400 focus:outline-none"
          />
          <span className="text-sm text-slate-400">days</span>
        </div>
      </label>

      <Button type="submit" className="mt-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400">
        <Save aria-hidden="true" />
        Save task
      </Button>
    </form>
  );
}
