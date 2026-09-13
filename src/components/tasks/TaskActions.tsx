import { useState } from "react";
import { CheckIcon, PencilIcon, TrashIcon } from "lucide-react";

import EditTaskForm from "@/components/tasks/EditTaskForm";
import { Button } from "@/components/ui/button";
import type { MaintenanceTaskDisplayItem } from "@/lib/maintenance-tasks";

interface TaskActionsProps {
  task: MaintenanceTaskDisplayItem;
}

export default function TaskActions({ task }: TaskActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editPanelId = `edit-task-panel-${task.id}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            aria-controls={editPanelId}
            aria-expanded={isEditing}
            onClick={() => {
              setIsEditing((currentValue) => !currentValue);
            }}
          >
            <PencilIcon data-icon="inline-start" aria-hidden="true" />
            Edit task
          </Button>

          <form
            method="POST"
            action="/api/tasks/delete"
            onSubmit={(event) => {
              if (!window.confirm("Delete this task permanently?")) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="taskId" value={task.id} />
            <Button type="submit" variant="destructive" className="w-full sm:w-auto">
              <TrashIcon data-icon="inline-start" aria-hidden="true" />
              Delete
            </Button>
          </form>
        </div>

        <form method="POST" action="/api/tasks/complete">
          <input type="hidden" name="taskId" value={task.id} />
          <Button type="submit" className="w-full sm:w-auto">
            <CheckIcon data-icon="inline-start" aria-hidden="true" />
            Mark completed
          </Button>
        </form>
      </div>

      {isEditing && (
        <div id={editPanelId}>
          <EditTaskForm
            taskId={task.id}
            name={task.name}
            lastCompletedDate={task.lastCompletedDate}
            recurrenceIntervalDays={task.recurrenceIntervalDays}
          />
        </div>
      )}
    </div>
  );
}
