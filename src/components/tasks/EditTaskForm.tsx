import { SaveIcon } from "lucide-react";

import { TaskFormFields, useTaskFormController } from "@/components/tasks/TaskFormFields";
import { Button } from "@/components/ui/button";

interface EditTaskFormProps {
  taskId: string;
  name: string;
  lastCompletedDate: string;
  recurrenceIntervalDays: number;
  formId?: string;
}

export default function EditTaskForm({
  taskId,
  name,
  lastCompletedDate,
  recurrenceIntervalDays,
  formId = `edit-task-${taskId}`,
}: EditTaskFormProps) {
  const taskForm = useTaskFormController({
    initialValues: {
      name,
      lastCompletedDate,
      recurrenceIntervalDays: String(recurrenceIntervalDays),
    },
  });

  return (
    <div className="mt-4 flex flex-col gap-4">
      <form id={formId} method="POST" action="/api/tasks/update" noValidate onSubmit={taskForm.handleSubmit}>
        <input type="hidden" name="taskId" value={taskId} />
        <TaskFormFields controller={taskForm} idPrefix={formId} className="grid gap-4 sm:grid-cols-2" />
      </form>

      <div className="flex justify-end">
        <Button type="submit" form={formId}>
          <SaveIcon data-icon="inline-start" aria-hidden="true" />
          Save changes
        </Button>
      </div>
    </div>
  );
}
