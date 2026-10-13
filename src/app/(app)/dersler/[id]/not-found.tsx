import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function CourseNotFound() {
  return (
    <EmptyState
      icon={SearchXIcon}
      title="Ders bulunamadı"
      description="Bu ders silinmiş olabilir ya da sana ait değil."
      action={
        <Button asChild variant="outline">
          <Link href="/dersler">Derslere dön</Link>
        </Button>
      }
    />
  );
}
