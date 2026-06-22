import ShrinkableButton from './ShrinkableButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

type Option = {
  key: string | number;
  text: string;
  value: unknown;
};

const ShrinkableDropdownButton = ({
  children,
  color,
  disabled,
  hidden,
  icon,
  loading,
  mediaQuery,
  onChange,
  onClick,
  options,
}: {
  readonly children: ReactNode;
  readonly color?: string;
  readonly disabled?: boolean;
  readonly hidden?: boolean;
  readonly icon: ReactNode;
  readonly loading?: boolean;
  readonly mediaQuery?: string;
  readonly onChange?: (value: unknown, ...rest: unknown[]) => void;
  readonly onClick?: () => void;
  readonly options?: Option[];
}) => {
  if (hidden) return null;

  const variant = color === 'red' ? 'destructive' : color === 'green' ? 'success' : 'default';

  return (
    <div className="flex">
      <ShrinkableButton
        className="rounded-r-none"
        disabled={disabled}
        icon={icon}
        loading={loading}
        mediaQuery={mediaQuery}
        onClick={onClick}
        variant={variant}
      >
        {children}
      </ShrinkableButton>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              className="rounded-l-none border-l-0 px-2"
              disabled={disabled}
              variant={variant}
            />
          }
        >
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options?.map((opt) => (
            <DropdownMenuItem
              key={opt.key}
              onClick={() => onChange?.(opt.value)}
            >
              {opt.text}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ShrinkableDropdownButton;
