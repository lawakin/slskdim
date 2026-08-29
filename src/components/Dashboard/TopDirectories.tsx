import { type DirectoryRow } from '../../lib/reports';
import { FolderOpen } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const getLastTwoSegments = (path: string): string => {
  if (!path) {
    return path;
  }

  const parts = path.split(/[/\\]/u).filter((p) => p.length > 0);

  if (parts.length <= 2) {
    return parts.join('/');
  }

  return parts.slice(-2).join('/');
};

const TopDirectories = ({ rows }: { readonly rows: DirectoryRow[] }) => (
  <>
    <h5 className="mb-2 flex items-center gap-2 font-medium">
      <FolderOpen className="h-4 w-4" /> Directories
    </h5>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8 text-right text-muted-foreground">
            #
          </TableHead>
          <TableHead>Directory</TableHead>
          <TableHead className="text-right">Downloads</TableHead>
          <TableHead className="text-right">Distinct Users</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(!rows || rows.length === 0) && (
          <TableRow>
            <TableCell
              className="text-center opacity-50"
              colSpan={4}
            >
              No data to display
            </TableCell>
          </TableRow>
        )}
        {rows?.map((row, index) => (
          <TableRow key={row.directory}>
            <TableCell className="text-right text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell title={row.directory}>
              {getLastTwoSegments(row.directory)}
            </TableCell>
            <TableCell className="text-right">
              {row.count.toLocaleString()}
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

export default TopDirectories;
