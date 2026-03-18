"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

function upsertLink(rel: string, href: string) {
  const selector = `link[rel='${rel}']`;
  const existing = document.querySelector<HTMLLinkElement>(selector);

  if (existing) {
    existing.href = href;
    return;
  }

  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  document.head.appendChild(link);
}

export function ThemeFavicon() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    const iconHref = resolvedTheme === "dark" ? "/white-logo.png" : "/dark-logo.png";
    upsertLink("icon", iconHref);
    upsertLink("shortcut icon", iconHref);
    upsertLink("apple-touch-icon", iconHref);
  }, [resolvedTheme]);

  return null;
}
