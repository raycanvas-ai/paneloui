"use client"

import * as React from "react"

// ui-sdk reads the direction from the page, so this only feeds useDirection.
type Direction = "ltr" | "rtl"

const DirectionContext = React.createContext<Direction | undefined>(undefined)

function DirectionProvider({
  dir,
  direction,
  children,
}: {
  dir?: Direction
  direction?: Direction
  children?: React.ReactNode
}) {
  return (
    <DirectionContext.Provider value={direction ?? dir}>
      {children}
    </DirectionContext.Provider>
  )
}

function useDirection(localDir?: Direction): Direction {
  const globalDir = React.useContext(DirectionContext)
  return localDir || globalDir || "ltr"
}

export { DirectionProvider, useDirection }
