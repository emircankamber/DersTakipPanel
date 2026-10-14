import { Skeleton } from "@/components/ui/skeleton";

export default function OdevlerLoading() {
  return (
    <div aria-busy="true" aria-label="Yükleniyor">
      <div className="mb-10 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
