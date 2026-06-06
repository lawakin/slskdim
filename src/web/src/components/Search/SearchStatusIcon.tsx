import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Check, CircleHelp, Clock, Loader2, StopCircle, X } from 'lucide-react';

const StatusIcon = ({ state }: { readonly state: string }) => {
  switch (state) {
    case 'None':
    case 'Queued':
    case 'Requested':
      return <Clock className="h-4 w-4" />;
    case 'InProgress':
      return <Loader2 className="h-4 w-4 animate-spin text-green-500" />;
    case 'Completed, TimedOut':
    case 'Completed, ResponseLimitReached':
    case 'Completed, FileLimitReached':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'Completed, Cancelled':
      return <StopCircle className="h-4 w-4 text-green-500" />;
    case 'Completed, Errored':
      return <X className="h-4 w-4 text-red-500" />;
    default:
      return <CircleHelp className="h-4 w-4 text-yellow-500" />;
  }
};

const SearchStatusIcon = ({ state }: { readonly state: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <StatusIcon state={state} />
      </TooltipTrigger>
      <TooltipContent>{state}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default SearchStatusIcon;
