"use client";

import { useSyncExternalStore } from "react";

import {
  type ColorScheme,
  coerceSetting,
  DEFAULT_SETTINGS,
  SETTING_NAMES,
  SETTINGS,
  type SettingName,
  type Settings,
  type SettingValue,
} from "./settings";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * <html> is the source of truth: the boot script writes the saved values there
 * before paint, and every change goes through `updateSetting`. This module only
 * caches a snapshot of it for React.
 */
let snapshot: Settings | null = null;
const listeners = new Set<() => void>();

function readFromDocument(): Settings {
  const root = document.documentElement;
  return Object.fromEntries(
    SETTING_NAMES.map((name) => [name, coerceSetting(name, root.getAttribute(SETTINGS[name].attribute))]),
  ) as Settings;
}

function currentSettings(): Settings {
  snapshot ??= readFromDocument();
  return snapshot;
}

function resolveScheme(mode: Settings["mode"]): ColorScheme {
  if (mode !== "system") return mode;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function paintColorScheme(mode: Settings["mode"]) {
  const root = document.documentElement;
  const scheme = resolveScheme(mode);

  // Freeze transitions for a frame so every surface flips at once instead of fading unevenly.
  root.classList.add("disable-transitions");
  root.classList.toggle("dark", scheme === "dark");
  root.style.colorScheme = scheme;
  requestAnimationFrame(() => root.classList.remove("disable-transitions"));
}

export function updateSetting<N extends SettingName>(name: N, value: SettingValue<N>) {
  const { attribute, cookie } = SETTINGS[name];
  document.documentElement.setAttribute(attribute, value);
  if (name === "mode") paintColorScheme(value as Settings["mode"]);

  // biome-ignore lint/suspicious/noDocumentCookie: a plain cookie keeps the pre-paint boot script dependency-free.
  document.cookie = `${cookie}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;

  snapshot = { ...currentSettings(), [name]: value };
  for (const notify of listeners) notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reads and writes one setting. Server and hydration render the defaults, then the saved value. */
export function useSetting<N extends SettingName>(name: N) {
  const value = useSyncExternalStore(
    subscribe,
    () => currentSettings()[name],
    () => DEFAULT_SETTINGS[name],
  );
  return [value, (next: SettingValue<N>) => updateSetting(name, next)] as const;
}
