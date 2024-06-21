import { cn } from '~/lib/utils';

interface LoaderProps {
  loading: boolean;
  relative?: boolean;
  background?: boolean;
  blocking?: boolean;
  className?: string;
}

export function Loader({
  loading,
  relative,
  background,
  blocking = false,
  className,
}: LoaderProps) {
  return (
    <span
      className={cn('inset-0 z-50 flex items-center justify-center transition-all', className)}
      style={{
        position: relative ? 'absolute' : 'fixed',
        opacity: loading ? 1 : 0,
        // display: loading ? "flex" : "none",
        pointerEvents: loading && blocking ? 'auto' : 'none',
        backgroundColor: background ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
      }}
    >
      <span role="status">
        <span className="flex gap-2">
          <span className="sr-only">Loading...</span>
          <span className="size-[8px] animate-pulse rounded-sm bg-current opacity-85"></span>
          <span className="size-[8px] animate-pulse rounded-sm bg-current opacity-85"></span>
          <span className="size-[8px] animate-pulse rounded-sm bg-current opacity-85"></span>
        </span>
      </span>
    </span>
  );
}
