"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Calendar as CalendarPrimitive,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarMonthSelect,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarYearSelect,
  type CalendarGridCell,
  type CalendarState,
  type CalendarValue,
} from "@ui-sdk/react/calendar"

import { type Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

type DateRange = { from: Date | undefined; to?: Date | undefined }

type CalendarClassNames = Partial<
  Record<
    | "root"
    | "months"
    | "month"
    | "nav"
    | "button_previous"
    | "button_next"
    | "month_caption"
    | "dropdowns"
    | "dropdown_root"
    | "dropdown"
    | "caption_label"
    | "month_grid"
    | "weekdays"
    | "weekday"
    | "week"
    | "day"
    | "range_start"
    | "range_middle"
    | "range_end"
    | "today"
    | "outside"
    | "disabled"
    | "hidden",
    string
  >
>

type CalendarSelection =
  | { mode?: "single"; selected?: Date; onSelect?: (date: Date | undefined) => void }
  | { mode: "multiple"; selected?: Date[]; onSelect?: (dates: Date[] | undefined) => void }
  | { mode: "range"; selected?: DateRange; onSelect?: (range: DateRange | undefined) => void }

type CalendarProps = CalendarSelection & {
  className?: string
  classNames?: CalendarClassNames
  showOutsideDays?: boolean
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  numberOfMonths?: number
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  fixedWeeks?: boolean
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  required?: boolean
  locale?: string
}

type CalendarDayModifiers = {
  selected: boolean
  today: boolean
  outside: boolean
  disabled: boolean
  hidden: boolean
  range_start: boolean
  range_middle: boolean
  range_end: boolean
}

const pad = (n: number) => String(n).padStart(2, "0")
const toISODate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const fromISO = (iso: string) => {
  const [year = 0, month = 1, day = 1] = iso.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toValue(selection: CalendarSelection): CalendarValue | undefined {
  if (selection.selected === undefined) return undefined
  if (selection.mode === "range") {
    const { from, to } = selection.selected
    return from ? [toISODate(from), toISODate(to ?? from)] : null
  }
  if (selection.mode === "multiple") return selection.selected.map(toISODate)
  return toISODate(selection.selected)
}

function emit(selection: CalendarSelection, value: CalendarValue) {
  if (selection.mode === "range") {
    const range = Array.isArray(value) ? value : null
    selection.onSelect?.(
      range?.[0] && range[1] ? { from: fromISO(range[0]), to: fromISO(range[1]) } : undefined
    )
  } else if (selection.mode === "multiple") {
    selection.onSelect?.(Array.isArray(value) ? value.map(fromISO) : undefined)
  } else {
    selection.onSelect?.(typeof value === "string" ? fromISO(value) : undefined)
  }
}

// react-day-picker paints no hover preview while a range is being picked, so
// ranges are drawn from the committed value and the anchor, not ui-sdk's preview.
function selectionOf(date: string, state: CalendarState) {
  const { mode, value, anchor } = state
  if (mode === "range") {
    const [start, end] = anchor ? [anchor, anchor] : Array.isArray(value) ? value : []
    if (!start || !end || date < start || date > end) {
      return { selected: false, range_start: false, range_middle: false, range_end: false }
    }
    return {
      selected: true,
      range_start: date === start,
      range_middle: date !== start && date !== end,
      range_end: date === end,
    }
  }
  const selected = Array.isArray(value) ? value.includes(date) : value === date
  return { selected, range_start: false, range_middle: false, range_end: false }
}

function dayClassName(classes: CalendarClassNames, modifiers: CalendarDayModifiers) {
  return [
    classes.day,
    modifiers.disabled && classes.disabled,
    modifiers.hidden && classes.hidden,
    modifiers.outside && classes.outside,
    modifiers.today && classes.today,
    modifiers.range_end && classes.range_end,
    modifiers.range_middle && classes.range_middle,
    modifiers.range_start && classes.range_start,
  ]
    .filter(Boolean)
    .join(" ")
}

function dayAttributes(date: string, modifiers: CalendarDayModifiers) {
  return {
    "data-day": date,
    "data-selected": modifiers.selected || undefined,
    "data-disabled": modifiers.disabled || undefined,
    "data-hidden": modifiers.hidden || undefined,
    "data-outside": modifiers.outside || undefined,
    "data-today": modifiers.today || undefined,
  }
}

function setFocused(event: React.FocusEvent<HTMLElement>, focused: boolean) {
  if (focused) event.currentTarget.dataset.focused = "true"
  else delete event.currentTarget.dataset.focused
}

function Calendar(props: CalendarProps) {
  const {
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    buttonVariant = "ghost",
    numberOfMonths = 1,
    month,
    defaultMonth,
    onMonthChange,
    fixedWeeks,
    weekStartsOn = 0,
    required,
    locale,
  } = props
  const formatLocale = locale ?? "en-US"
  const dropdown = captionLayout.startsWith("dropdown")
  const value = toValue(props)

  const classes: CalendarClassNames = {
    root: "w-fit",
    months: "relative flex flex-col gap-4 md:flex-row",
    month: "flex w-full flex-col gap-4",
    nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
    button_previous: cn(
      buttonVariants({ variant: buttonVariant }),
      "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
      "rdp-button_previous"
    ),
    button_next: cn(
      buttonVariants({ variant: buttonVariant }),
      "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
      "rdp-button_next"
    ),
    month_caption:
      "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
    dropdowns:
      "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
    dropdown_root: "relative rounded-(--cell-radius)",
    dropdown: "absolute inset-0 bg-popover opacity-0",
    caption_label: cn(
      "font-medium select-none",
      captionLayout === "label"
        ? "text-sm"
        : "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground"
    ),
    month_grid: "w-full border-collapse",
    weekdays: "flex",
    weekday:
      "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
    week: "mt-2 flex w-full",
    day: "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius) [&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
    range_start:
      "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
    range_middle: "rounded-none",
    range_end:
      "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
    today:
      "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
    outside: "text-muted-foreground aria-selected:text-muted-foreground",
    disabled: "text-muted-foreground opacity-50",
    hidden: "invisible",
    ...classNames,
  }

  const monthOf = (first: string, offset: number) => {
    const [year = 0, monthIndex = 1] = first.split("-").map(Number)
    return new Date(year, monthIndex - 1 + offset, 1)
  }

  const renderCell = (cell: CalendarGridCell, state: CalendarState) => {
    if (cell.hidden && !showOutsideDays) {
      const modifiers: CalendarDayModifiers = {
        selected: false,
        today: false,
        outside: true,
        disabled: false,
        hidden: true,
        range_start: false,
        range_middle: false,
        range_end: false,
      }
      return (
        <td
          key={cell.date}
          role="gridcell"
          className={dayClassName(classes, modifiers)}
          {...dayAttributes(cell.date, modifiers)}
        />
      )
    }

    // ui-sdk shows a date in one grid only; react-day-picker repeats outside
    // days in every month, so the repeat forwards its press to the real day.
    if (cell.hidden) {
      const modifiers: CalendarDayModifiers = {
        ...selectionOf(cell.date, state),
        today: cell.date === toISODate(new Date()),
        outside: true,
        disabled: state.disabled,
        hidden: false,
      }
      return (
        <td
          key={cell.date}
          className={dayClassName(classes, modifiers)}
          {...dayAttributes(cell.date, modifiers)}
        >
          <CalendarDayButton
            day={cell.date}
            modifiers={modifiers}
            locale={locale}
            disabled={modifiers.disabled || undefined}
            onClick={(event) =>
              event.currentTarget
                .closest("[data-slot=calendar]")
                ?.querySelector<HTMLElement>(
                  `[data-slot="calendar-day"][data-value="${cell.date}"]`
                )
                ?.click()
            }
          />
        </td>
      )
    }

    return (
      <CalendarDay
        key={cell.date}
        value={cell.date}
        onFocus={(event) => setFocused(event, true)}
        onBlur={(event) => setFocused(event, false)}
        render={(dayProps, day) => {
          const modifiers: CalendarDayModifiers = {
            ...selectionOf(day.date, state),
            today: day.today,
            outside: day.outside,
            disabled: day.disabled,
            hidden: false,
          }
          return (
            <td
              {...dayProps}
              className={`outline-none ${dayClassName(classes, modifiers)}`}
              {...dayAttributes(day.date, modifiers)}
            >
              <CalendarDayButton
                day={day.date}
                modifiers={modifiers}
                locale={locale}
                disabled={modifiers.disabled || undefined}
              />
            </td>
          )
        }}
      />
    )
  }

  const renderCaption = (state: CalendarState, offset: number) => {
    const shown = monthOf(state.month, offset)
    if (!dropdown || offset > 0) {
      return (
        <span className={classes.caption_label} aria-hidden="true">
          {shown.toLocaleString(formatLocale, { month: "long", year: "numeric" })}
        </span>
      )
    }

    const monthLabel = shown.toLocaleString(formatLocale, { month: "short" })
    const yearLabel = String(shown.getFullYear())
    const control = (select: React.ReactNode, label: string) => (
      <span data-disabled={state.disabled || undefined} className={classes.dropdown_root}>
        {select}
        <span className={classes.caption_label} aria-hidden="true">
          {label}
          <ChevronDownIcon className={cn("size-4", "rdp-chevron")} />
        </span>
      </span>
    )

    return (
      <div className={classes.dropdowns}>
        {captionLayout === "dropdown-years" ? (
          <span>{monthLabel}</span>
        ) : (
          control(<CalendarMonthSelect className={classes.dropdown} />, monthLabel)
        )}
        {captionLayout === "dropdown-months" ? (
          <span>{yearLabel}</span>
        ) : (
          control(<CalendarYearSelect className={classes.dropdown} />, yearLabel)
        )}
      </div>
    )
  }

  return (
    <CalendarPrimitive
      data-slot="calendar"
      mode={props.mode ?? "single"}
      value={value}
      onValueChange={(next) => emit(props, next)}
      month={month ? toISODate(month).slice(0, 7) : undefined}
      defaultMonth={defaultMonth ? toISODate(defaultMonth).slice(0, 7) : undefined}
      onMonthChange={(next) => onMonthChange?.(fromISO(next))}
      deselectable={!required}
      months={numberOfMonths}
      locale={formatLocale}
      weekStartsOn={weekStartsOn}
      weekdayFormat="short"
      monthFormat={dropdown ? "short" : "long"}
      fixedWeeks={fixedWeeks}
      showOutsideDays={showOutsideDays}
      className={cn(
        classes.root,
        "group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
    >
      {(state) => (
        <div className={classes.months}>
          <CalendarHeading className="sr-only" />
          <nav className={classes.nav}>
            <CalendarPrevious className={classes.button_previous}>
              <ChevronLeftIcon className={cn("size-4", "rdp-chevron")} />
            </CalendarPrevious>
            <CalendarNext className={classes.button_next}>
              <ChevronRightIcon className={cn("size-4", "rdp-chevron")} />
            </CalendarNext>
          </nav>
          {Array.from({ length: numberOfMonths }, (_, offset) => (
            <div key={offset} className={classes.month}>
              <div className={classes.month_caption}>{renderCaption(state, offset)}</div>
              <CalendarGrid offset={offset} className={classes.month_grid}>
                {(grid) => (
                  <>
                    <thead aria-hidden="true">
                      <tr className={classes.weekdays}>
                        {grid.weekdays.map((weekday, index) => (
                          <CalendarWeekday key={weekday} index={index} className={classes.weekday}>
                            {(header) => header.label.slice(0, 2)}
                          </CalendarWeekday>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grid.weeks.map((week) => (
                        <tr key={week[0]?.date} className={classes.week}>
                          {week.map((cell) => renderCell(cell, state))}
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </CalendarGrid>
            </div>
          ))}
        </div>
      )}
    </CalendarPrimitive>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  onMouseDown,
  ...props
}: React.ComponentProps<"button"> & {
  day: string
  modifiers: CalendarDayModifiers
  locale?: string
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      data-slot="button"
      data-variant="ghost"
      data-size="icon"
      data-day={fromISO(day).toLocaleDateString(locale)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        buttonVariants({
          variant: "ghost",
          size: "icon",
          className: cn(
            "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
            className
          ),
        })
      )}
      // The day cell holds focus and the keyboard; the button only paints it.
      onMouseDown={(event) => {
        onMouseDown?.(event)
        event.preventDefault()
        event.currentTarget.parentElement?.focus()
      }}
      {...props}
    >
      {props.children ?? fromISO(day).getDate()}
    </button>
  )
}

export { Calendar, CalendarDayButton, type DateRange }
