"use client";

import { useEffect } from "react";
import { RotateCwIcon, TriangleAlertIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={TriangleAlertIcon}
      title="Bir şeyler ters gitti"
      description="Veriler yüklenirken bir sorun oluştu. Bağlantını kontrol edip tekrar dene."
      action={
        <Button variant="outline" onClick={reset}>
          <RotateCwIcon />
          Tekrar dene
        </Button>
      }
    />
  );
}
