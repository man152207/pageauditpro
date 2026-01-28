import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text';
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variant === 'default' && "rounded-lg",
        variant === 'circular' && "rounded-full",
        variant === 'text' && "rounded h-4",
        className
      )}
      {...props}
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton variant="circular" className="h-9 w-9" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton variant="text" className="w-full" />
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 p-4">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border last:border-0 p-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" className="h-8 w-8" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-20 ml-auto rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton variant="circular" className="h-9 w-9" />
      </div>
      <Skeleton className="h-9 w-24 mb-2" />
      <Skeleton variant="text" className="w-32" />
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonStatCard };
