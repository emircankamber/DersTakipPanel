import { Skeleton } from "@/components/ui/skeleton";

export default function CourseLoading() {
  return (
    <div aria-busy="true" aria-label="Yükleniyor">
      <Skeleton className="mb-5 h-4 w-16" />
      <Skeleton className="h-8 w-72 max-w-full" />
      <Skeleton className="mt-3 mb-10 h-4 w-80 max-w-full" />
      <div className="flex gap-1.5 overflow-hidden">
        {Array.from({ length: 14 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-12 shrink-0 rounded-lg sm:w-[52px]" />
        ))}
      </div>
      <Skeleton className="mt-8 mb-5 h-6 w-28" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
