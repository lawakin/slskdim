import * as reports from '../../lib/reports';
import { type LeaderboardRow } from '../../lib/reports';
import { formatBytes, formatSpeed } from '../../lib/util';
import { ChevronDown, Download, Loader2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const SORT_FIELDS = [
  { label: 'Count', sort: 'Count' },
  { label: 'Total Size', sort: 'TotalBytes' },
  { label: 'Avg Speed', sort: 'AverageSpeed' },
];

const LeaderboardTable = ({
  loading,
  onSort,
  rows,
  sortBy,
}: {
  readonly loading: boolean;
  readonly onSort: (sort: string) => void;
  readonly rows: LeaderboardRow[];
  readonly sortBy: string;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-8 text-right text-muted-foreground">#</TableHead>
        <TableHead>Username</TableHead>
        {SORT_FIELDS.map(({ label, sort }) => (
          <TableHead
            className="cursor-pointer text-right select-none"
            key={sort}
            onClick={() => onSort(sort)}
          >
            {label}
            {sortBy === sort && (
              <ChevronDown className="ml-1 inline h-3 w-3" />
            )}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {loading && (
        <TableRow>
          <TableCell
            className="text-center"
            colSpan={5}
          >
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          </TableCell>
        </TableRow>
      )}
      {!loading && (!rows || rows.length === 0) && (
        <TableRow>
          <TableCell
            className="text-center opacity-50"
            colSpan={5}
          >
            No data to display
          </TableCell>
        </TableRow>
      )}
      {!loading &&
        rows?.map((row, index) => (
          <TableRow key={row.username}>
            <TableCell className="text-right text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell>{row.username}</TableCell>
            <TableCell className="text-right">
              {row.count.toLocaleString()}
            </TableCell>
            <TableCell className="text-right">
              {formatBytes(row.totalBytes)}
            </TableCell>
            <TableCell className="text-right">
              {formatSpeed(row.averageSpeed)}
            </TableCell>
          </TableRow>
        ))}
    </TableBody>
  </Table>
);

type State = {
  loading: { download: boolean; upload: boolean };
  rows: { download: LeaderboardRow[]; upload: LeaderboardRow[] };
  sortBy: string;
};

const initialState: State = {
  loading: { download: false, upload: false },
  rows: { download: [], upload: [] },
  sortBy: 'Count',
};

const Leaderboard = ({
  downloads,
  end,
  start,
  uploads,
}: {
  readonly downloads: LeaderboardRow[];
  readonly end?: string;
  readonly start?: string;
  readonly uploads: LeaderboardRow[];
}) => {
  const [state, setState] = useState<State>(initialState);
  const sortRef = useRef<string | null>(null);

  useEffect(() => {
    setState((previous) => ({
      ...previous,
      rows: { download: downloads, upload: uploads },
      sortBy: 'Count',
    }));
  }, [downloads, uploads]);

  const onSort = async (sort: string) => {
    if (sort === state.sortBy) return;

    sortRef.current = sort;

    setState((previous) => ({
      ...previous,
      loading: { download: true, upload: true },
      sortBy: sort,
    }));

    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : new Date();

    let newUploads = state.rows.upload;
    let newDownloads = state.rows.download;

    try {
      [newUploads, newDownloads] = await Promise.all([
        reports.getLeaderboard({
          direction: 'Upload',
          end: endDate,
          sortBy: sort,
          start: startDate,
        }),
        reports.getLeaderboard({
          direction: 'Download',
          end: endDate,
          sortBy: sort,
          start: startDate,
        }),
      ]);
    } catch (error) {
      console.error(error);
    }

    if (sortRef.current !== sort) return;

    setState((previous) => ({
      ...previous,
      loading: { download: false, upload: false },
      rows: { download: newDownloads, upload: newUploads },
    }));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 md:divide-x md:divide-border">
      <div className="md:pr-6">
        <h5 className="mb-2 flex items-center gap-2 font-medium">
          <Download className="h-4 w-4" /> Downloads
        </h5>
        <LeaderboardTable
          loading={state.loading.download}
          onSort={onSort}
          rows={state.rows.download}
          sortBy={state.sortBy}
        />
      </div>
      <div className="md:pl-6">
        <h5 className="mb-2 flex items-center gap-2 font-medium">
          <Upload className="h-4 w-4" /> Uploads
        </h5>
        <LeaderboardTable
          loading={state.loading.upload}
          onSort={onSort}
          rows={state.rows.upload}
          sortBy={state.sortBy}
        />
      </div>
    </div>
  );
};

export default Leaderboard;
