import {
  type ByteUnit,
  formatBytes,
  formatBytesAsUnit,
  getFileName,
} from '../../lib/util';
import { type TransferFile } from '../../types';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Progress } from '../ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import TransferDetails from './TransferDetails';
import {
  FolderClosed,
  FolderOpen,
  Info,
  RefreshCcw,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
// import {
//   Button,
//   Checkbox,
//   Header,
//   Icon,
//   List,
//   Popup,
//   Progress,
//   Table,
// } from 'semantic-ui-react';

const getColor = (state: string) => {
  switch (state) {
    case 'InProgress':
      return { color: 'blue' };
    case 'Completed, Succeeded':
      return { color: 'green' };
    case 'Requested':
    case 'Queued, Locally':
    case 'Queued, Remotely':
    case 'Queued':
      return {};
    case 'Initializing':
      return { color: 'teal' };
    default:
      return { color: 'red' };
  }
};

const isRetryableState = (state: string) => getColor(state).color === 'red';
const isQueuedState = (state: string) => state.includes('Queued');

const formatBytesTransferred = ({ size, transferred }) => {
  const [s, sExtension] = formatBytes(size, 1).split(' ');
  const t = formatBytesAsUnit(transferred, sExtension as ByteUnit, 1);

  return `${t}/${s} ${sExtension}`;
};

const TransferList = ({
  directoryName,
  files,
  onPlaceInQueueRequested,
  onRetryRequested,
  onSelectionChange,
}: {
  readonly directoryName: string;
  readonly files: Array<TransferFile & { selected?: boolean }>;
  readonly onPlaceInQueueRequested: (file: TransferFile) => void;
  readonly onRetryRequested: (file: TransferFile) => void;
  readonly onSelectionChange: (
    directoryName: string,
    file: TransferFile,
    selected: boolean,
  ) => void;
}) => {
  const [isFolded, setIsFolded] = useState(false);

  // eslint-disable-next-line consistent-return
  const handleClick = (file: TransferFile) => {
    const { direction, state } = file;

    if (direction === 'Download') {
      if (isRetryableState(state)) return onRetryRequested(file);
      if (isQueuedState(state)) return onPlaceInQueueRequested(file);
    }
  };

  return (
    <div>
      <h3 className="flex">
        <button
          className="cursor-pointer"
          onClick={() => setIsFolded(!isFolded)}
          type="button"
        >
          {isFolded ? (
            <FolderClosed className="h-4 w-4" />
          ) : (
            <FolderOpen className="h-4 w-4" />
          )}
        </button>
        <span>{directoryName}</span>
      </h3>
      {!isFolded && (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="transferlist-selector">
                  <Checkbox
                    checked={files.filter((f) => !f.selected).length === 0}
                    onCheckedChange={(checked) => {
                      for (const file of files)
                        onSelectionChange(
                          directoryName,
                          file,
                          Boolean(checked),
                        );
                    }}
                  />
                </TableHead>
                <TableHead className="transferlist-filename">File</TableHead>
                <TableHead className="transferlist-progress">
                  Progress
                </TableHead>
                <TableHead className="transferlist-size">Size</TableHead>
                <TableHead className="transferlist-detail">
                  <Info
                  // name="info circle"
                  // size="small"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files
                .sort((a, b) =>
                  getFileName(a.filename).localeCompare(
                    getFileName(b.filename),
                  ),
                )
                .map((f) => (
                  <TableRow key={f.filename}>
                    <TableCell className="transferlist-selector">
                      <Checkbox
                        checked={f.selected}
                        onCheckedChange={(checked) =>
                          onSelectionChange(directoryName, f, Boolean(checked))
                        }
                      />
                    </TableCell>
                    <TableCell className="transferlist-filename">
                      {getFileName(f.filename)}
                    </TableCell>
                    <TableCell className="transferlist-progress">
                      {f.state === 'InProgress' ? (
                        <Progress
                          // color={getColor(f.state).color}
                          value={Math.round(f.percentComplete)}
                          // progress
                          // style={{ margin: 0 }}
                        />
                      ) : (
                        <Button
                          // fluid
                          // size="mini"
                          style={{
                            cursor: f.direction === 'Upload' ? 'unset' : '',
                            margin: 0,
                            padding: 7,
                          }}
                          {...getColor(f.state)}
                          {...(!getColor(f.state).color && f.attempts > 1
                            ? { color: 'yellow' }
                            : {})}
                          // active={f.direction === 'Upload'}
                          onClick={() => handleClick(f)}
                        >
                          {f.direction === 'Download' &&
                            isQueuedState(f.state) && <RefreshCcw />}
                          {f.direction === 'Download' &&
                            isRetryableState(f.state) && <RotateCcw />}
                          {f.state}
                          {f.placeInQueue ? ` (#${f.placeInQueue})` : ''}
                          {f.attempts > 1 ? ` (Retry #${f.attempts})` : ''}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="transferlist-size">
                      <div
                        style={{
                          alignItems: 'center',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>
                          {formatBytesTransferred({
                            size: f.size,
                            transferred: f.bytesTransferred,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="transferlist-detail">
                      <Popover>
                        <PopoverTrigger>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="w-[600px]">
                          <TransferDetails file={f} />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TransferList;
