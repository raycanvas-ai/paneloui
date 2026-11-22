"use client"

import type * as React from "react"
import {
  createToaster,
  Toast,
  ToastAction,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  type ToastType,
} from "@ui-sdk/react/toast"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const icons: Partial<Record<ToastType, React.ReactNode>> = {
  success: (
    <CircleCheckIcon className="size-4" />
  ),
  info: (
    <InfoIcon className="size-4" />
  ),
  warning: (
    <TriangleAlertIcon className="size-4" />
  ),
  error: (
    <OctagonXIcon className="size-4" />
  ),
  loading: (
    <Loader2Icon className="size-4 animate-spin" />
  ),
}

// sonner's stylesheet (2.0.8), ported to ui-sdk's toast attributes and stack
// variables so toasts keep their exact look, stacking and motion.
const styles = `
[data-sonner-toaster] {
  --toast-icon-margin-start: -3px;
  --toast-icon-margin-end: 4px;
  --toast-svg-margin-start: -1px;
  --toast-svg-margin-end: 0px;
  --toast-button-margin-start: auto;
  --toast-button-margin-end: 0;
  --border-radius: 8px;
  position: fixed;
  inset: auto;
  right: 24px;
  bottom: 24px;
  width: var(--width);
  height: auto;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: visible;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,
    Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  box-sizing: border-box;
  list-style: none;
  outline: none;
  z-index: 999999999;
}
html[dir="rtl"] [data-sonner-toaster] {
  --toast-icon-margin-start: 4px;
  --toast-icon-margin-end: -3px;
  --toast-svg-margin-start: 0px;
  --toast-svg-margin-end: -1px;
  --toast-button-margin-start: 0;
  --toast-button-margin-end: auto;
}
[data-sonner-toaster] > [data-slot="toast-list"] {
  margin: 0;
  padding: 0;
  list-style: none;
}
[data-sonner-toast] {
  --y: translateY(0);
  z-index: calc(100 - var(--toast-index));
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 1;
  transform: var(--y);
  touch-action: none;
  transition: transform 400ms, opacity 400ms, height 400ms, box-shadow 200ms;
  box-sizing: border-box;
  outline: none;
  overflow-wrap: anywhere;
  padding: 16px;
  background: var(--normal-bg);
  border: 1px solid var(--normal-border);
  color: var(--normal-text);
  border-radius: var(--border-radius);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  width: var(--width);
  height: var(--toast-height);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}
[data-sonner-toast]:focus-visible {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.2);
}
[data-sonner-toast] > * {
  transition: opacity 400ms;
}
[data-sonner-toast][data-expanded]::after {
  content: "";
  position: absolute;
  left: 0;
  height: calc(var(--gap) + 1px);
  bottom: 100%;
  width: 100%;
}
[data-sonner-toast]:not([data-front]):not([data-expanded]) {
  --y: translateY(calc(var(--toast-index) * var(--gap) * -1)) scale(calc(1 - var(--toast-index) * 0.05));
  height: var(--toast-front-height);
}
[data-sonner-toast]:not([data-front]):not([data-expanded]) > * {
  opacity: 0;
}
[data-sonner-toast][data-expanded] {
  --y: translateY(calc(-1 * (var(--toast-offset) + var(--toast-index) * var(--gap))));
}
[data-sonner-toast][data-starting-style] {
  --y: translateY(100%);
  opacity: 0;
  transition: none;
}
[data-sonner-toast][data-ending-style][data-front]:not([data-swipe-direction]) {
  --y: translateY(100%);
  opacity: 0;
}
[data-sonner-toast][data-ending-style]:not([data-front]):not([data-swipe-direction])[data-expanded] {
  --y: translateY(calc(100% - var(--toast-offset) - var(--toast-index) * var(--gap)));
  opacity: 0;
}
[data-sonner-toast][data-ending-style]:not([data-front]):not([data-swipe-direction]):not([data-expanded]) {
  --y: translateY(40%);
  opacity: 0;
  transition: transform 500ms, opacity 200ms;
}
[data-sonner-toast][data-swiping] {
  transform: var(--y) translateY(var(--toast-swipe-y, 0px)) translateX(var(--toast-swipe-x, 0px));
  transition: none;
  user-select: none;
}
[data-sonner-toast][data-ending-style][data-swipe-direction] {
  opacity: 0;
  transition: transform 200ms ease-out, opacity 200ms ease-out;
}
[data-sonner-toast][data-ending-style][data-swipe-direction="left"] {
  transform: var(--y) translateX(calc(var(--toast-swipe-x, 0px) - 100%));
}
[data-sonner-toast][data-ending-style][data-swipe-direction="right"] {
  transform: var(--y) translateX(calc(var(--toast-swipe-x, 0px) + 100%));
}
[data-sonner-toast][data-ending-style][data-swipe-direction="up"] {
  transform: var(--y) translateY(calc(var(--toast-swipe-y, 0px) - 100%));
}
[data-sonner-toast][data-ending-style][data-swipe-direction="down"] {
  transform: var(--y) translateY(calc(var(--toast-swipe-y, 0px) + 100%));
}
[data-sonner-toast] [data-icon] {
  display: flex;
  height: 16px;
  width: 16px;
  position: relative;
  justify-content: flex-start;
  align-items: center;
  flex-shrink: 0;
  margin-left: var(--toast-icon-margin-start);
  margin-right: var(--toast-icon-margin-end);
}
[data-sonner-toast] [data-icon] > * {
  flex-shrink: 0;
}
[data-sonner-toast] [data-icon] svg {
  margin-left: var(--toast-svg-margin-start);
  margin-right: var(--toast-svg-margin-end);
}
[data-sonner-toast] [data-content] {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
[data-sonner-toast] [data-title] {
  font-weight: 500;
  line-height: 1.5;
  color: inherit;
}
[data-sonner-toast] [data-description] {
  font-weight: 400;
  line-height: 1.4;
  color: #3f3f3f;
}
.dark [data-sonner-toast] [data-description] {
  color: hsl(0, 0%, 91%);
}
[data-sonner-toast] [data-button] {
  border-radius: 4px;
  padding-left: 8px;
  padding-right: 8px;
  height: 24px;
  font-size: 12px;
  color: var(--normal-bg);
  background: var(--normal-text);
  margin-left: var(--toast-button-margin-start);
  margin-right: var(--toast-button-margin-end);
  border: none;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: opacity 400ms, box-shadow 200ms;
}
[data-sonner-toast] [data-button]:focus-visible {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4);
}
@media (max-width: 600px) {
  [data-sonner-toaster] {
    right: 16px;
    left: 16px;
    bottom: 16px;
    width: 100%;
  }
  [data-sonner-toaster] [data-sonner-toast] {
    left: 0;
    right: 0;
    width: calc(100% - 32px);
  }
}
@media (prefers-reduced-motion) {
  [data-sonner-toast],
  [data-sonner-toast] > * {
    transition: none !important;
    animation: none !important;
  }
}
`

const toaster = createToaster<React.ReactNode>({ duration: 4000 })

type ToastOptions = {
  id?: string
  description?: React.ReactNode
  duration?: number
  action?: { label: React.ReactNode; onClick: () => void }
  onDismiss?: () => void
}

const show =
  (type: ToastType) =>
  (message: React.ReactNode, { action, onDismiss, ...options }: ToastOptions = {}) =>
    toaster(message, {
      ...options,
      type,
      action: action && {
        label: action.label,
        onAction: () => action.onClick(),
        dismiss: true,
      },
      onDismiss: onDismiss && (() => onDismiss()),
    })

const toast = Object.assign(show("default"), {
  success: show("success"),
  info: show("info"),
  warning: show("warning"),
  error: show("error"),
  loading: show("loading"),
  dismiss: (id?: string) => toaster.dismiss(id),
})

const Toaster = ({
  ...props
}: Omit<React.ComponentProps<typeof ToastRegion>, "toaster" | "children">) => {
  return (
    <>
      <style href="ui-toaster" precedence="default">
        {styles}
      </style>
      <ToastRegion
        toaster={toaster}
        side="bottom"
        align="end"
        maxVisible={3}
        shortcut="alt+t"
        data-sonner-toaster=""
        className="toaster group"
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
            "--width": "356px",
            "--gap": "14px",
          } as React.CSSProperties
        }
        {...props}
      >
        {(item) => (
          <Toast data-sonner-toast="" className="cn-toast">
            {icons[item.type] && <div data-icon="">{icons[item.type]}</div>}
            <div data-content="">
              <ToastTitle data-title="" />
              <ToastDescription data-description="" />
            </div>
            <ToastAction data-button="" data-action="" />
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { Toaster, toast }
