import { SETTINGS } from "./settings";

/**
 * Inline <head> script: restores saved settings from cookies onto <html> and sets the
 * colour scheme before first paint, so pages never flash the wrong theme. It also keeps
 * "system" mode in sync with the OS for the life of the tab. Plain ES5 on purpose.
 */
const source = `(function (settings) {
  try {
    var root = document.documentElement;
    var saved = {};
    document.cookie.split(";").forEach(function (pair) {
      var at = pair.indexOf("=");
      if (at > 0) saved[pair.slice(0, at).trim()] = decodeURIComponent(pair.slice(at + 1));
    });
    Object.keys(settings).forEach(function (name) {
      var spec = settings[name];
      var value = saved[spec.cookie];
      root.setAttribute(spec.attribute, spec.options.indexOf(value) > -1 ? value : spec.fallback);
    });
    var modeAttr = settings.mode.attribute;
    var osDark = window.matchMedia("(prefers-color-scheme: dark)");
    var paint = function () {
      var mode = root.getAttribute(modeAttr);
      var dark = mode === "dark" || (mode === "system" && osDark.matches);
      root.classList.toggle("dark", dark);
      root.style.colorScheme = dark ? "dark" : "light";
    };
    paint();
    osDark.addEventListener("change", function () {
      if (root.getAttribute(modeAttr) === "system") paint();
    });
  } catch (error) {
    console.warn("[panelo] could not restore preferences", error);
  }
})(${JSON.stringify(SETTINGS)});`;

export function PreferenceBootScript() {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: the script must run inline, before hydration.
  return <script dangerouslySetInnerHTML={{ __html: source }} />;
}
