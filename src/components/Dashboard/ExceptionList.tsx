import { type ExceptionRow } from '../../lib/reports';
import { formatDate, getFileName, truncate } from '../../lib/util';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const DIRECTIONS = ['Upload', 'Download', 'All'];

const ExceptionList = ({
  direction,
  loading,
  onDirectionChange,
  rows,
}: {
  readonly direction: string;
  readonly loading: boolean;
  readonly onDirectionChange: (direction: string) => void;
  readonly rows: ExceptionRow[];
}) => (
  <>
    <h5 className="mt-4 mb-2 flex items-center gap-2 font-medium">
      <span>Recent Errors</span>
      <div className="ml-auto flex gap-1">
        {DIRECTIONS.map((d) => (
          <Button
            key={d}
            onClick={() => onDirectionChange(d)}
            size="xs"
            variant={direction === d ? 'default' : 'outline'}
          >
            {d}
          </Button>
        ))}
      </div>
    </h5>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Direction</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Filename</TableHead>
          <TableHead>Exception</TableHead>
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
        {rows.length === 0 && !loading && (
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
          rows.map((row) => (
            <TableRow key={`${row.direction}-${row.endedAt}-${row.filename}`}>
              <TableCell className="whitespace-nowrap">
                {row.endedAt ? formatDate(row.endedAt) : ''}
              </TableCell>
              <TableCell>{row.direction}</TableCell>
              <TableCell>{row.username}</TableCell>
              <TableCell title={row.filename}>
                {row.filename ? getFileName(row.filename) : ''}
              </TableCell>
              <TableCell title={row.exception}>
                {truncate(row.exception, 80)}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </>
);

export default ExceptionList;
