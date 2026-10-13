"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CourseFormDialog } from "./course-form-dialog";
import type { Course } from "@/lib/types";

export function NewCourseButton({
  label = "Yeni ders",
  defaults,
  variant = "default",
  size = "default",
}: {
  label?: string;
  defaults?: Partial<Pick<Course, "color" | "start_date">>;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <PlusIcon />
        {label}
      </Button>
      <CourseFormDialog open={open} onOpenChange={setOpen} defaults={defaults} />
    </>
  );
}
