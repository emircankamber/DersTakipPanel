"use client";

import * as React from "react";
import { useTheme } from "next-themes";

/** Recharts SVG öznitelikleri CSS değişkeni okuyamaz; temaya göre düz renkler. */
export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const dark = resolvedTheme !== "light";
  return {
    mounted,
    dark,
    grid: dark ? "#26272c" : "#ececef",
    axis: dark ? "#33343a" : "#d9d9de",
    muted: dark ? "#8b8c94" : "#71717a",
    secondary: dark ? "#c4c5cc" : "#52525b",
    surface: dark ? "#18191d" : "#ffffff",
  };
}

export function useIsNarrow(breakpoint = 640) {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return narrow;
}
