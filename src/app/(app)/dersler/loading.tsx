import { Skeleton } from "@/components/ui/skeleton";

export default function DerslerLoading() {
  return (
    <div aria-busy="true" aria-label="Yükleniyor">
      <div className="mb-10 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
