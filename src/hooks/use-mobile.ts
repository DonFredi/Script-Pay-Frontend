import * as React from "react"

const MOBILE_BREAKPOINT = 768
// Matches Tailwind's `lg` breakpoint — the point at which dashboards
// conventionally pin the sidebar in place instead of leaving it toggleable.
const LARGE_BREAKPOINT = 1024

function subscribe(breakpoint: number) {
  return (callback: () => void) => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    mql.addEventListener("change", callback)
    return () => mql.removeEventListener("change", callback)
  }
}

function getSnapshot(breakpoint: number) {
  return () => window.innerWidth < breakpoint
}

function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe(MOBILE_BREAKPOINT), getSnapshot(MOBILE_BREAKPOINT), getServerSnapshot)
}

// True below the `lg` breakpoint (tablet and phone) — the sidebar stays
// toggleable there. At/above it (large desktop), the sidebar is pinned open
// and non-toggleable, per common dashboard convention (GitHub, Linear, Vercel).
export function useIsLargeScreen() {
  return !React.useSyncExternalStore(
    subscribe(LARGE_BREAKPOINT),
    getSnapshot(LARGE_BREAKPOINT),
    getServerSnapshot,
  )
}
