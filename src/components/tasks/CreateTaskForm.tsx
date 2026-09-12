import { SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function CreateTaskForm() {
  return (
    <form method="POST" action="/api/tasks/create" className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Task name</FieldLabel>
          <Input id="name" name="name" required maxLength={120} placeholder="HVAC filter" />
        </Field>

        <Field>
          <FieldLabel htmlFor="lastCompletedDate">Last completed</FieldLabel>
          <Input id="lastCompletedDate" type="date" name="lastCompletedDate" required />
        </Field>

        <Field>
          <FieldLabel htmlFor="recurrenceIntervalDays">Repeat every</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id="recurrenceIntervalDays"
              type="number"
              name="recurrenceIntervalDays"
              required
              min={1}
              step={1}
              inputMode="numeric"
            />
            <span className="text-muted-foreground text-sm">days</span>
          </div>
        </Field>
      </FieldGroup>

      <Button type="submit">
        <SaveIcon data-icon="inline-start" aria-hidden="true" />
        Save task
      </Button>
    </form>
  );
}
