import { FONT_IDS } from "@/lib/fonts/registry";

import { PRESET_IDS } from "./presets";

/**
 * Every user-tunable look-and-feel setting lives here. Each one is mirrored onto
 * <html> as a data attribute (CSS reads it) and stored in a cookie so the boot
 * script can restore it before first paint.
 */
export const SETTINGS = {
  mode: {
    attribute: "data-theme-mode",
    cookie: "panelo-mode",
    options: ["light", "dark", "system"],
    fallback: "light",
  },
  preset: {
    attribute: "data-theme-preset",
    cookie: "panelo-preset",
    options: PRESET_IDS,
    fallback: "default",
  },
  font: {
    attribute: "data-font",
    cookie: "panelo-font",
    options: FONT_IDS,
    fallback: "geist",
  },
  width: {
    attribute: "data-content-layout",
    cookie: "panelo-width",
    options: ["centered", "full-width"],
    fallback: "centered",
  },
} as const satisfies Record<
  string,
  { attribute: `data-${string}`; cookie: string; options: readonly string[]; fallback: string }
>;

export type SettingName = keyof typeof SETTINGS;
export type SettingValue<N extends SettingName> = (typeof SETTINGS)[N]["options"][number];
export type Settings = { [N in SettingName]: SettingValue<N> };
export type ColorScheme = "light" | "dark";

export const SETTING_NAMES = Object.keys(SETTINGS) as SettingName[];

export const DEFAULT_SETTINGS = Object.fromEntries(
  SETTING_NAMES.map((name) => [name, SETTINGS[name].fallback]),
) as Settings;

/** Narrows an untrusted string (cookie, attribute) to a known option, else the fallback. */
export function coerceSetting<N extends SettingName>(name: N, raw: string | null | undefined): SettingValue<N> {
  const options: readonly string[] = SETTINGS[name].options;
  return (raw && options.includes(raw) ? raw : SETTINGS[name].fallback) as SettingValue<N>;
}
