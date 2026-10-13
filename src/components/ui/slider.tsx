"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Slider({
  className,
  rangeClassName,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  rangeClassName?: string;
}) {
  const values = props.value ?? props.defaultValue ?? [0];
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none items-center py-2 select-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
        <SliderPrimitive.Range
          className={cn("absolute h-full bg-brand", rangeClassName)}
        />
      </SliderPrimitive.Track>
      {values.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label="Öğrenme seviyesi"
          className="block size-5 rounded-full border border-black/10 bg-white shadow-md ring-ring/30 transition-[box-shadow,transform] hover:scale-110 focus-visible:ring-4 focus-visible:outline-none active:scale-95"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
