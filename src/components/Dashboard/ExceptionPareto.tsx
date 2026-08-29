import { type ParetoRow } from '../../lib/reports';
import { truncate } from '../../lib/util';
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

const ExceptionPareto = ({
  direction,
  loading,
  onDirectionChange,
  rows,
}: {
  readonly direction: string;
  readonly loading: boolean;
  readonly onDirectionChange: (direction: string) => void;
  readonly rows: ParetoRow[];
}) => {
  const maxCount = rows.length > 0 ? rows[0].count : 1;

  return (
    <>
      <h5 className="mt-4 mb-2 flex items-center gap-2 font-medium">
        <span>Error Count By Type</span>
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
            <TableHead>Direction</TableHead>
            <TableHead>Exception</TableHead>
            <TableHead className="w-[120px]" />
            <TableHead className="text-right">Count</TableHead>
            <TableHead className="text-right">Distinct Users</TableHead>
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
          {!loading && rows.length === 0 && (
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
              <TableRow key={`${row.direction}-${row.exception ?? ''}`}>
                <TableCell>{row.direction}</TableCell>
                <TableCell title={row.exception}>
                  {truncate(row.exception, 80)}
                </TableCell>
                <TableCell>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-red-500"
                      style={{
                        width: `${Math.round((row.count / maxCount) * 100)}%`,
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <strong>{row.count.toLocaleString()}</strong>
                </TableCell>
                <TableCell className="text-right">
                  {row.distinctUsers.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
};

export default ExceptionPareto;
