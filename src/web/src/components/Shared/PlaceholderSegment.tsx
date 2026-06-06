import {
  Bug,
  CircleAlert,
  Download,
  FolderOpen,
  Lock,
  type LucideIcon,
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
import { type ReactNode } from 'react';

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

const PlaceholderSegment = ({
  caption,
  icon,
  size,
}: {
  readonly caption?: ReactNode;
  readonly icon?: string;
  readonly size?: 'small' | undefined;
}) => {
  const className =
    size === 'small' ? 'placeholder-segment-small' : 'placeholder-segment';
  const Icon = (icon && iconMap[icon]) ?? Search;

  return (
    <div
      className={`${className} flex flex-col items-center justify-center gap-2 p-8`}
    >
      <Icon className="h-8 w-8 text-muted-foreground" />
      {caption && (
        <p className="text-center text-muted-foreground">{caption}</p>
      )}
    </div>
  );
};

export default PlaceholderSegment;
