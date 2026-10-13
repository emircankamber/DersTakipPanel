import { Skeleton } from "@/components/ui/skeleton";

export default function PanelLoading() {
  return (
    <div aria-busy="true" aria-label="Yükleniyor">
      <div className="mb-10 space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl sm:h-32" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
