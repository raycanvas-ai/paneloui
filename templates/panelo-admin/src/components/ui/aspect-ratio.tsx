// Matches Radix's box: full width, `ratio` sets the height, children can fill it.
function AspectRatio({
  ratio = 1,
  style,
  ...props
}: React.ComponentProps<"div"> & { ratio?: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={{ position: "relative", width: "100%", aspectRatio: ratio, ...style }}
      {...props}
    />
  )
}

export { AspectRatio }
