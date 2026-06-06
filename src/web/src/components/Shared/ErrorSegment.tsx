import type { LucideIcon } from 'lucide-react';
import {
  Bug,
  CircleAlert,
  Download,
  FolderOpen,
  Lock,
  MessageCircle,
  MessagesSquare,
  Pencil,
  PowerOff,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';

const iconMap: Record<string, LucideIcon> = {
  attention: CircleAlert,
  bug: Bug,
  close: X,
  comment: MessageCircle,
  comments: MessagesSquare,
  download: Download,
  edit: Pencil,
  'folder open': FolderOpen,
  lock: Lock,
  redo: RotateCcw,
  refresh: RefreshCw,
  search: Search,
  shutdown: PowerOff,
  star: Star,
  'trash alternate': Trash2,
  upload: Upload,
  users: Users,
  x: X,
};

const ErrorSegment = ({
  caption,
  icon = 'x',
  suppressPrefix = false,
}: {
  readonly caption: ReactNode;
  readonly icon?: string;
  readonly suppressPrefix?: boolean;
}) => {
  const Icon = iconMap[icon] ?? CircleAlert;
  return (
    <div className="error-segment flex flex-col items-center justify-center gap-2 p-8">
      <Icon className="h-8 w-8 text-red-500" />
      <p className="text-center">
        {!suppressPrefix && 'Error: '}
        {caption}
      </p>
    </div>
  );
};

export default ErrorSegment;
