import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const MODES: {
  value: ThemeMode;
  label: string;
  icon: typeof SunIcon;
}[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
];

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  return storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "system";
}

function applyTheme(theme: ThemeMode) {
  const prefersDark = window.matchMedia(DARK_QUERY).matches;
  document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && prefersDark));
}

function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      applyTheme("system");
    };

    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [theme]);

  const selectTheme = (nextTheme: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <div
      aria-label="Theme"
      className={cn(
        "border-border bg-card text-card-foreground inline-flex rounded-4xl border p-1 shadow-sm",
        className,
      )}
      role="group"
    >
      {MODES.map(({ value, label, icon: Icon }) => (
        <Button
          aria-label={label}
          aria-pressed={theme === value}
          key={value}
          onClick={() => {
            selectTheme(value);
          }}
          size="icon-sm"
          type="button"
          variant={theme === value ? "secondary" : "ghost"}
        >
          <Icon data-icon="inline-start" />
        </Button>
      ))}
    </div>
  );
}

export { ThemeToggle };
