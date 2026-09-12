import type { ReactNode } from "react";
import { CircleAlertIcon, type LucideIcon } from "lucide-react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  name?: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: ReactNode;
  icon: LucideIcon;
  endContent?: ReactNode;
}

export function FormField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  hint,
  icon,
  endContent,
}: FormFieldProps) {
  const Icon = icon;

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 flex size-4 -translate-y-1/2 items-center justify-center [&_svg]:size-4">
          <Icon aria-hidden="true" />
        </span>
        <Input
          aria-invalid={!!error}
          id={id}
          name={name ?? id}
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className={cn("pl-10", endContent && "pr-10")}
        />
        {endContent}
      </div>
      {error ? (
        <FieldError className="flex items-center gap-1 text-xs">
          <CircleAlertIcon className="size-3" aria-hidden="true" />
          {error}
        </FieldError>
      ) : (
        hint
      )}
    </Field>
  );
}
