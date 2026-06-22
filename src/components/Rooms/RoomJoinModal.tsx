import './Rooms.css';
import * as rooms from '../../lib/rooms';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Gavel,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type SortKey = 'name' | 'userCount';

type AvailableRoom = {
  isModerated: boolean;
  isOwned: boolean;
  isPrivate: boolean;
  name: string;
  userCount: number;
};

const SortIcon = ({
  column,
  sortBy,
  sortOrder,
}: {
  readonly column: SortKey;
  readonly sortBy: SortKey;
  readonly sortOrder: 'asc' | 'desc';
}) => {
  if (sortBy !== column) return null;
  return sortOrder === 'asc' ? (
    <ChevronUp className="ml-1 inline h-3 w-3" />
  ) : (
    <ChevronDown className="ml-1 inline h-3 w-3" />
  );
};

const RoomJoinModal = ({
  joinRoom: parentJoinRoom,
}: {
  readonly joinRoom: (roomName: string) => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState<AvailableRoom[]>([]);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAvailableRooms = async () => {
      setLoading(true);
      const availableResult = await rooms.getAvailable();
      setAvailable(availableResult ?? []);
      setLoading(false);
    };

    if (open) void getAvailableRooms();
  }, [open]);

  const sortedAvailable = useMemo(() => {
    return [...available]
      .filter((room) => room.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        const cmp =
          typeof aValue === 'string'
            ? aValue.localeCompare(bValue as string)
            : (aValue as number) - (bValue as number);
        return sortOrder === 'asc' ? -cmp : cmp;
      });
  }, [available, filter, sortBy, sortOrder]);

  const close = () => {
    setAvailable([]);
    setSelected(undefined);
    setSortBy('name');
    setSortOrder('desc');
    setFilter('');
    setLoading(true);
    setOpen(false);
  };

  const joinRoom = async () => {
    if (!selected) return;
    await parentJoinRoom(selected);
    close();
  };

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (isOpen) setOpen(true);
        else close();
      }}
      open={open}
    >
      <DialogTrigger
        render={
          <Button
            className="add-button"
            size="icon"
            variant="ghost"
          />
        }
      >
        <Plus className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="join-room-modal max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Join Room
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <Input
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Room Filter"
              value={filter}
            />
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name
                      <SortIcon
                        column="name"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('userCount')}
                    >
                      Users
                      <SortIcon
                        column="userCount"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAvailable.map((room) => (
                    <TableRow
                      className={`cursor-pointer ${selected === room.name ? 'font-bold' : ''}`}
                      key={room.name}
                      onClick={() => setSelected(room.name)}
                    >
                      <TableCell>
                        {selected === room.name && (
                          <Check className="mr-1 inline h-3 w-3 text-green-500" />
                        )}
                        {room.isPrivate && (
                          <Lock className="mr-1 inline h-3 w-3" />
                        )}
                        {room.isOwned && (
                          <Crown className="mr-1 inline h-3 w-3" />
                        )}
                        {room.isModerated && (
                          <Gavel className="mr-1 inline h-3 w-3" />
                        )}
                        {room.name}
                      </TableCell>
                      <TableCell>{room.userCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        <DialogFooter>
          <Button
            onClick={close}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={!selected}
            onClick={() => joinRoom()}
          >
            Join
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomJoinModal;
