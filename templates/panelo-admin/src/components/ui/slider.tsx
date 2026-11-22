"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Slider as SliderPrimitive,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  onValueCommit,
  ...props
}: Omit<
  React.ComponentProps<typeof SliderPrimitive<number[]>>,
  "onValueChange" | "onValueCommit"
> & {
  onValueChange?: (value: number[]) => void
  onValueCommit?: (value: number[]) => void
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive<number[]>
      data-slot="slider"
      defaultValue={value === undefined ? _values : undefined}
      value={value}
      min={min}
      max={max}
      onValueChange={(next) => onValueChange?.(next)}
      onValueCommit={(next) => onValueCommit?.(next)}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      {/* Stands in for Radix's root as the flex box the track grows in. */}
      <SliderControl className="flex items-center data-horizontal:w-full data-vertical:h-full data-vertical:flex-col">
        {/* ui-sdk places thumbs inside the track, so the clipping that rounds
            the range moves to an inner box of the same size. */}
        <SliderTrack
          data-slot="slider-track"
          className="relative grow rounded-full bg-muted data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
        >
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <SliderIndicator
              className="absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full"
              render={<div data-slot="slider-range" />}
            />
          </div>
          {Array.from({ length: _values.length }, (_, index) => (
            <SliderThumb
              data-slot="slider-thumb"
              key={index}
              index={index}
              className="relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 has-focus-visible:ring-3 has-focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
            />
          ))}
        </SliderTrack>
      </SliderControl>
    </SliderPrimitive>
  )
}

export { Slider }
