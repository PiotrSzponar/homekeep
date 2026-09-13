import { useMemo, useState, type SyntheticEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  getBrowserLocalTodayDate,
  getDefaultTaskFormValues,
  hasTaskFormErrors,
  RECURRENCE_PRESETS,
  type TaskFormErrors,
  type TaskFormField,
  type TaskFormValues,
  validateTaskFormValues,
} from "@/components/tasks/task-form-rules";

interface TaskFormController {
  errors: TaskFormErrors;
  handleSubmit: (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => void;
  setFieldValue: (field: TaskFormField, value: string) => void;
  todayDate: string;
  values: TaskFormValues;
}

interface UseTaskFormControllerOptions {
  initialValues?: Partial<TaskFormValues>;
}

interface TaskFormFieldsProps {
  controller: TaskFormController;
  idPrefix: string;
  className?: string;
}

const TASK_FORM_FIELDS: TaskFormField[] = ["name", "lastCompletedDate", "recurrenceIntervalDays"];

export function useTaskFormController({ initialValues = {} }: UseTaskFormControllerOptions = {}): TaskFormController {
  const [todayDate] = useState(() => getBrowserLocalTodayDate());
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [values, setValues] = useState<TaskFormValues>(() => ({
    ...getDefaultTaskFormValues(todayDate),
    ...initialValues,
    recurrenceIntervalDays: initialValues.recurrenceIntervalDays ?? "",
  }));
  const [errors, setErrors] = useState<TaskFormErrors>({});

  function validate(nextValues: TaskFormValues): TaskFormErrors {
    const nextErrors = validateTaskFormValues(nextValues, todayDate);
    setErrors(nextErrors);
    return nextErrors;
  }

  function setFieldValue(field: TaskFormField, value: string) {
    setValues((currentValues) => {
      const nextValues = { ...currentValues, [field]: value };

      if (hasSubmitted) {
        validate(nextValues);
      }

      return nextValues;
    });
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    setHasSubmitted(true);

    const nextErrors = validate(values);
    const form = event.currentTarget;

    if (!hasTaskFormErrors(nextErrors)) {
      return;
    }

    event.preventDefault();

    window.requestAnimationFrame(() => {
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    });
  }

  return {
    errors,
    handleSubmit,
    setFieldValue,
    todayDate,
    values,
  };
}

export function TaskFormFields({ controller, idPrefix, className }: TaskFormFieldsProps) {
  const fieldIds = useMemo(
    () =>
      TASK_FORM_FIELDS.reduce(
        (ids, field) => ({
          ...ids,
          [field]: `${idPrefix}-${field}`,
        }),
        {} as Record<TaskFormField, string>,
      ),
    [idPrefix],
  );
  const errorIds = useMemo(
    () =>
      TASK_FORM_FIELDS.reduce(
        (ids, field) => ({
          ...ids,
          [field]: `${fieldIds[field]}-error`,
        }),
        {} as Record<TaskFormField, string>,
      ),
    [fieldIds],
  );

  function describedBy(field: TaskFormField): string | undefined {
    return controller.errors[field] ? errorIds[field] : undefined;
  }

  return (
    <FieldGroup className={className}>
      <Field data-invalid={Boolean(controller.errors.name)}>
        <FieldLabel htmlFor={fieldIds.name}>Task name</FieldLabel>
        <Input
          id={fieldIds.name}
          name="name"
          value={controller.values.name}
          onChange={(event) => {
            controller.setFieldValue("name", event.target.value);
          }}
          required
          maxLength={120}
          placeholder="HVAC filter"
          aria-invalid={Boolean(controller.errors.name)}
          aria-describedby={describedBy("name")}
        />
        <FieldError id={errorIds.name}>{controller.errors.name}</FieldError>
      </Field>

      <Field data-invalid={Boolean(controller.errors.lastCompletedDate)}>
        <FieldLabel htmlFor={fieldIds.lastCompletedDate}>Last completed</FieldLabel>
        <Input
          id={fieldIds.lastCompletedDate}
          type="date"
          name="lastCompletedDate"
          value={controller.values.lastCompletedDate}
          onChange={(event) => {
            controller.setFieldValue("lastCompletedDate", event.target.value);
          }}
          required
          max={controller.todayDate}
          aria-invalid={Boolean(controller.errors.lastCompletedDate)}
          aria-describedby={describedBy("lastCompletedDate")}
        />
        <FieldError id={errorIds.lastCompletedDate}>{controller.errors.lastCompletedDate}</FieldError>
      </Field>

      <Field data-invalid={Boolean(controller.errors.recurrenceIntervalDays)}>
        <FieldLabel htmlFor={fieldIds.recurrenceIntervalDays}>Repeat every</FieldLabel>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {RECURRENCE_PRESETS.map((preset) => {
              const isSelected = controller.values.recurrenceIntervalDays === String(preset.days);

              return (
                <Button
                  key={preset.days}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  aria-pressed={isSelected}
                  onClick={() => {
                    controller.setFieldValue("recurrenceIntervalDays", String(preset.days));
                  }}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
          <div className="flex min-w-36 flex-1 items-center gap-2">
            <Input
              id={fieldIds.recurrenceIntervalDays}
              type="text"
              name="recurrenceIntervalDays"
              value={controller.values.recurrenceIntervalDays}
              onChange={(event) => {
                controller.setFieldValue("recurrenceIntervalDays", event.target.value);
              }}
              required
              inputMode="numeric"
              aria-invalid={Boolean(controller.errors.recurrenceIntervalDays)}
              aria-describedby={describedBy("recurrenceIntervalDays")}
            />
            <span className="text-muted-foreground text-sm">days</span>
          </div>
        </div>
        <FieldError id={errorIds.recurrenceIntervalDays}>{controller.errors.recurrenceIntervalDays}</FieldError>
      </Field>
    </FieldGroup>
  );
}
