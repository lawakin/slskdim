import { list } from '../../../lib/events';
import { LoaderSegment } from '../../Shared';
import { Button } from '../../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const PER_PAGE = 10;

type Event = {
  data: string;
  id: string;
  timestamp: string;
  type: string;
};

const replaceHyphensWithNonBreakingEquivalent = (s?: string) =>
  s?.replace(/-/gu, '‑');

const Events = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const fetch = async () => {
    setLoading(true);
    const { events: items, totalCount } = await list({
      limit: PER_PAGE,
      offset: (page - 1) * PER_PAGE,
    });
    const tp = Math.ceil(totalCount / PER_PAGE);
    setEvents(items);
    setTotalPages(Number.isNaN(tp) ? 0 : tp);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <LoaderSegment />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          size="sm"
          variant="outline"
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          size="sm"
          variant="outline"
        >
          Next
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">Id</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell
                className="text-center text-muted-foreground"
                colSpan={4}
              >
                No events
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="font-mono">{event.id}</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  {replaceHyphensWithNonBreakingEquivalent(event.timestamp)}
                </TableCell>
                <TableCell>{event.type}</TableCell>
                <TableCell>
                  <pre className="whitespace-pre-wrap text-xs">
                    {JSON.stringify(JSON.parse(event.data), null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Events;
