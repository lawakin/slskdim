import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

const LoaderSegment = ({
  children,
  className = '',
}: {
  readonly children?: ReactNode;
  readonly className?: string;
}) => (
  <div
    className={`loader-segment flex flex-col items-center justify-center gap-2 p-8 ${className}`}
  >
    <Loader2 className="h-8 w-8 animate-spin" />
    {children && <p className="text-muted-foreground">{children}</p>}
  </div>
);

export default LoaderSegment;
