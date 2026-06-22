import {
  formatAttributes,
  formatBytes,
  formatSeconds,
  getFileName,
} from '../../lib/util';
import { Checkbox } from '../ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Folder, FolderOpen, Lock, X } from 'lucide-react';
import { useState } from 'react';

type FileEntry = {
  bitDepth?: number;
  bitRate?: number;
  filename: string;
  isVariableBitRate?: boolean;
  length?: number;
  sampleRate?: number;
  selected?: boolean;
  size?: number;
};

const FileList = ({
  directoryName,
  disabled,
  files,
  footer,
  locked,
  onClose,
  onSelectionChange,
}: {
  readonly directoryName?: string;
  readonly disabled?: boolean;
  readonly files?: FileEntry[];
  readonly footer?: React.ReactNode;
  readonly locked?: boolean;
  readonly onClose?: () => void;
  readonly onSelectionChange?: (file: FileEntry, checked: boolean) => void;
}) => {
  const [folded, setFolded] = useState(false);

  return (
    <div className={locked ? 'muted' : ''}>
      <div className="filelist-header flex items-center gap-2 py-1 text-sm font-medium">
        <button
          className="flex items-center gap-1"
          disabled={locked}
          onClick={() => !locked && setFolded(!folded)}
          type="button"
        >
          {locked ? (
            <Lock className="h-4 w-4" />
          ) : folded ? (
            <Folder className="h-4 w-4" />
          ) : (
            <FolderOpen className="h-4 w-4" />
          )}
        </button>
        {directoryName}
        {Boolean(onClose) && (
          <button
            className="close-button ml-auto text-red-500"
            onClick={() => onClose?.()}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {!folded && files && files.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="filelist-selector w-8">
                <Checkbox
                  checked={files.filter((f) => !f.selected).length === 0}
                  disabled={disabled}
                  onCheckedChange={(checked) =>
                    files.map((f) => onSelectionChange?.(f, Boolean(checked)))
                  }
                />
              </TableHead>
              <TableHead className="filelist-filename">File</TableHead>
              <TableHead className="filelist-size">Size</TableHead>
              <TableHead className="filelist-attributes">Attributes</TableHead>
              <TableHead className="filelist-length">Length</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files
              .sort((a, b) => (a.filename > b.filename ? 1 : -1))
              .map((f) => (
                <TableRow key={f.filename}>
                  <TableCell className="filelist-selector">
                    <Checkbox
                      checked={f.selected}
                      disabled={disabled}
                      onCheckedChange={(checked) =>
                        onSelectionChange?.(f, Boolean(checked))
                      }
                    />
                  </TableCell>
                  <TableCell className="filelist-filename">
                    {locked && <Lock className="mr-1 inline h-3 w-3" />}
                    {getFileName(f.filename)}
                  </TableCell>
                  <TableCell className="filelist-size">
                    {formatBytes(f.size)}
                  </TableCell>
                  <TableCell className="filelist-attributes">
                    {formatAttributes(f as never)}
                  </TableCell>
                  <TableCell className="filelist-length">
                    {formatSeconds(f.length)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          {footer && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>{footer}</TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      )}
    </div>
  );
};

export default FileList;
