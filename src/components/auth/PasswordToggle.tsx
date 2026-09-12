import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  const Icon = visible ? EyeOffIcon : EyeIcon;

  return (
    <Button
      type="button"
      onClick={onToggle}
      className="absolute top-1/2 right-1.5 -translate-y-1/2"
      variant="ghost"
      size="icon-sm"
      aria-label={visible ? "Hide password" : "Show password"}
    >
      <Icon data-icon="inline-start" aria-hidden="true" />
    </Button>
  );
}
