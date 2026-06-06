import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Loader2 } from 'lucide-react';
import { type ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';

const ShrinkableButton = ({
  children,
  className,
  disabled,
  icon,
  loading,
  mediaQuery,
  onClick,
  variant,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly icon: ReactNode;
  readonly loading?: boolean;
  readonly mediaQuery?: string;
  readonly onClick?: () => void;
  readonly variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}) => {
  const shouldShrink = useMediaQuery({
    query: mediaQuery ?? '(max-width: 0px)',
  });
  const iconElement = loading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    icon
  );

  if (!shouldShrink) {
    return (
      <Button
        className={className}
        disabled={disabled}
        onClick={onClick}
        variant={variant}
      >
        {iconElement}
        {children}
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              className={className}
              disabled={disabled}
              onClick={onClick}
              variant={variant}
            />
          }
        >
          {iconElement}
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ShrinkableButton;
