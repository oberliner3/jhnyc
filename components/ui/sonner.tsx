"use client";

import { useTheme } from "next-themes";
import { type ToasterProps, Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "light" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="group toaster"
      toastOptions={{
        classNames: {
          description: "group-[.toast]:text-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "hsl(var(--sidebar))",
          "--normal-text": "hsl(var(--sidebar-foreground))",
          "--normal-border": "hsl(var(--border))",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
