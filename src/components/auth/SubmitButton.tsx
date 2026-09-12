import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface SubmitButtonProps {
  pendingText: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function SubmitButton({ pendingText, icon, children }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const Icon = icon;

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <span className="flex items-center gap-2">
          <Spinner aria-hidden="true" />
          {pendingText}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Icon data-icon="inline-start" aria-hidden="true" />
          {children}
        </span>
      )}
    </Button>
  );
}
