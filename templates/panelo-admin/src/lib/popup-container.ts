import type * as React from "react";

// Radix portalled popups to <body>; ui-sdk renders them in place, where they would inherit the trigger's
// text styles. An open modal dialog makes the rest of the page inert, so popups opened inside one render into it.
export function popupContainer(): Element | undefined {
  if (typeof document === "undefined") return undefined;
  const dialogs = document.querySelectorAll('[aria-modal="true"]:not([data-closed])');
  return dialogs[dialogs.length - 1] ?? document.body;
}

// Radix `asChild`: the only child becomes the rendered element, which ui-sdk spells `render`.
export function asChildProps(asChild: boolean | undefined, children: React.ReactNode) {
  return asChild ? { render: children as React.ReactElement<Record<string, unknown>> } : { children };
}

// Radix parts took plain children; ui-sdk also accepts a function of state, which wrappers that place children don't.
export type WithNodeChildren<P> = Omit<P, "children"> & { children?: React.ReactNode };
