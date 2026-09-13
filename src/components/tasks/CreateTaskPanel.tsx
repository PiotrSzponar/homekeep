import { useState } from "react";
import { PlusIcon } from "lucide-react";

import CreateTaskForm from "@/components/tasks/CreateTaskForm";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CreateTaskPanelProps {
  hasTasks: boolean;
}

export default function CreateTaskPanel({ hasTasks }: CreateTaskPanelProps) {
  const [isOpen, setIsOpen] = useState(!hasTasks);
  const contentId = "create-task-panel-content";

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Create task</CardTitle>
        {hasTasks && (
          <CardAction className="sm:hidden">
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-controls={contentId}
              aria-expanded={isOpen}
              onClick={() => {
                setIsOpen((currentValue) => !currentValue);
              }}
            >
              <PlusIcon data-icon="inline-start" aria-hidden="true" />
              Add task
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent id={contentId} className={cn(hasTasks && !isOpen && "hidden sm:block")}>
        <CreateTaskForm />
      </CardContent>
    </Card>
  );
}
