"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Carousel as CarouselPrimitive,
  CarouselContent as CarouselContentPrimitive,
  CarouselItem as CarouselItemPrimitive,
  CarouselNext as CarouselNextPrimitive,
  CarouselPrevious as CarouselPreviousPrimitive,
  CarouselViewport,
  createCarouselController,
  type CarouselAlign,
  type CarouselController,
} from "@ui-sdk/react/carousel"

import { type Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

type CarouselApi = CarouselController

type CarouselOptions = {
  align?: CarouselAlign
  loop?: boolean
  dragFree?: boolean
  skipSnaps?: boolean
  slidesToScroll?: number | "auto"
  startIndex?: number
  watchDrag?: boolean
}

type CarouselProps = {
  opts?: CarouselOptions
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  api: CarouselApi
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

type ButtonStyleProps = Pick<
  React.ComponentProps<typeof Button>,
  "variant" | "size"
>

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  className,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof CarouselPrimitive>,
  "orientation" | "controller" | "children"
> &
  CarouselProps & { children?: React.ReactNode }) {
  const [api] = React.useState(createCarouselController)

  React.useEffect(() => {
    setApi?.(api)
  }, [api, setApi])

  return (
    <CarouselPrimitive
      controller={api}
      orientation={orientation}
      align={opts?.align ?? "center"}
      loop={opts?.loop}
      dragFree={opts?.dragFree}
      skipSnaps={opts?.skipSnaps}
      slidesPerPage={opts?.slidesToScroll}
      defaultPage={opts?.startIndex === undefined ? undefined : opts.startIndex + 1}
      drag={opts?.watchDrag}
      className={cn("relative", className)}
      aria-roledescription="carousel"
      data-slot="carousel"
      {...props}
    >
      {() => (
        <CarouselContext.Provider
          value={{
            api,
            opts,
            orientation,
            scrollPrev: () => api.previous(),
            scrollNext: () => api.next(),
            canScrollPrev: api.canPrevious(),
            canScrollNext: api.canNext(),
          }}
        >
          {children}
        </CarouselContext.Provider>
      )}
    </CarouselPrimitive>
  )
}

// The negative margin sits on the scrolling viewport, not the slide row, so
// each page snaps flush with the edge as embla's translated container did.
function CarouselContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CarouselContentPrimitive>) {
  const { orientation } = useCarousel()

  return (
    <div className="overflow-hidden" data-slot="carousel-content">
      <CarouselViewport
        className={cn(
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          orientation === "horizontal" ? "-ml-4" : "-mt-4",
          typeof className === "string" ? className : undefined
        )}
      >
        <CarouselContentPrimitive
          className={cn("flex", orientation === "vertical" && "h-full flex-col")}
          {...props}
        >
          {children}
        </CarouselContentPrimitive>
      </CarouselViewport>
    </div>
  )
}

function CarouselItem({
  className,
  ...props
}: React.ComponentProps<typeof CarouselItemPrimitive>) {
  const { orientation } = useCarousel()

  return (
    <CarouselItemPrimitive
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={(state) =>
        cn(
          "min-w-0 shrink-0 grow-0 basis-full",
          orientation === "horizontal" ? "pl-4" : "pt-4",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof CarouselPreviousPrimitive> & ButtonStyleProps) {
  const { orientation } = useCarousel()

  return (
    <CarouselPreviousPrimitive
      data-slot="carousel-previous"
      data-variant={variant}
      data-size={size}
      className={(state) =>
        cn(
          buttonVariants({
            variant,
            size,
            className: cn(
              "absolute touch-manipulation rounded-full data-disabled:pointer-events-none data-disabled:opacity-50",
              orientation === "horizontal"
                ? "inset-y-0 -left-12 my-auto"
                : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
              typeof className === "function" ? className(state) : className
            ),
          })
        )
      }
      {...props}
    >
      <ChevronLeftIcon />
      <span className="sr-only">Previous slide</span>
    </CarouselPreviousPrimitive>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof CarouselNextPrimitive> & ButtonStyleProps) {
  const { orientation } = useCarousel()

  return (
    <CarouselNextPrimitive
      data-slot="carousel-next"
      data-variant={variant}
      data-size={size}
      className={(state) =>
        cn(
          buttonVariants({
            variant,
            size,
            className: cn(
              "absolute touch-manipulation rounded-full data-disabled:pointer-events-none data-disabled:opacity-50",
              orientation === "horizontal"
                ? "inset-y-0 -right-12 my-auto"
                : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
              typeof className === "function" ? className(state) : className
            ),
          })
        )
      }
      {...props}
    >
      <ChevronRightIcon />
      <span className="sr-only">Next slide</span>
    </CarouselNextPrimitive>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}
