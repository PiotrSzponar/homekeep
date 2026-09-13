import { SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TaskFormFields, useTaskFormController } from "@/components/tasks/TaskFormFields";

export default function CreateTaskForm() {
  const taskForm = useTaskFormController();

  return (
    <form
      method="POST"
      action="/api/tasks/create"
      className="flex flex-col gap-6"
      noValidate
      onSubmit={taskForm.handleSubmit}
    >
      <TaskFormFields controller={taskForm} idPrefix="create-task" />

      <Button type="submit">
        <SaveIcon data-icon="inline-start" aria-hidden="true" />
        Save task
      </Button>
    </form>
  );
}
