import * as transfers from '../../lib/transfers';
import { type UserDirectoryFile } from '../../lib/users';
import {
  formatAttributes,
  formatBytes,
  formatSeconds,
  getFileName,
} from '../../lib/util';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Check, Download, Folder, FolderOpen, Loader2, Lock, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { type TreeNode } from './browseTypes';

type QualifiedFile = UserDirectoryFile & {
  bitRate?: number;
  isVariableBitRate?: boolean;
  length?: number;
};

type DownloadRequest = 'inProgress' | 'complete' | 'error' | undefined;

type DownloadError = {
  data: string;
  status: number;
  statusText: string;
};

// Every file under `node` and its subdirectories, with a fully-qualified path.
const collectFiles = (node: TreeNode, separator: string): QualifiedFile[] => [
  ...(node.files ?? []).map((f) => ({
    ...f,
    filename: `${node.name}${separator}${f.filename}`,
  })),
  ...(node.children ?? []).flatMap((child) => collectFiles(child, separator)),
];

const countDirectories = (node: TreeNode): number =>
  (node.children ?? []).reduce(
    (sum, child) => sum + 1 + countDirectories(child),
    0,
  );

const formatCaption = (fileCount: number, dirCount: number) => {
  const parts: string[] = [];
  if (fileCount > 0) parts.push(`${fileCount} file${fileCount === 1 ? '' : 's'}`);
  if (dirCount > 0)
    parts.push(`${dirCount} director${dirCount === 1 ? 'y' : 'ies'}`);
  return parts.length > 0 ? parts.join(', ') : '0 files';
};

const Directory = ({
  directory,
  locked,
  marginTop,
  onClose,
  onNavigate,
  separator,
  username,
}: {
  readonly directory: TreeNode;
  readonly locked?: boolean;
  readonly marginTop?: number;
  readonly onClose: () => void;
  readonly onNavigate?: (dir: TreeNode) => void;
  readonly separator: string;
  readonly username: string;
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloadError, setDownloadError] = useState<DownloadError | undefined>(
    undefined,
  );
  const [downloadRequest, setDownloadRequest] =
    useState<DownloadRequest>(undefined);

  useEffect(() => {
    setSelected(new Set());
    setDownloadError(undefined);
    setDownloadRequest(undefined);
  }, [directory.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const rootFiles = useMemo<QualifiedFile[]>(
    () =>
      (directory.files ?? [])
        .map((f) => ({
          ...f,
          filename: `${directory.name}${separator}${f.filename}`,
        }))
        .sort((a, b) => a.filename.localeCompare(b.filename)),
    [directory, separator],
  );

  const childDirs = useMemo(
    () =>
      [...(directory.children ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [directory],
  );

  // recursive file list per direct child directory
  const filesByChild = useMemo(() => {
    const map = new Map<string, QualifiedFile[]>();
    for (const child of childDirs) {
      map.set(child.name, collectFiles(child, separator));
    }

    return map;
  }, [childDirs, separator]);

  const allFiles = useMemo<QualifiedFile[]>(
    () => [
      ...rootFiles,
      ...childDirs.flatMap((c) => filesByChild.get(c.name) ?? []),
    ],
    [rootFiles, childDirs, filesByChild],
  );

  const toggleMany = (filenames: string[], checked: boolean) => {
    setDownloadError(undefined);
    setDownloadRequest(undefined);
    setSelected((previous) => {
      const next = new Set(previous);
      for (const name of filenames) {
        if (checked) next.add(name);
        else next.delete(name);
      }

      return next;
    });
  };

  const selectedFiles = allFiles.filter((f) => selected.has(f.filename));
  const selectedSize = formatBytes(
    selectedFiles.reduce((total, f) => total + (f.size ?? 0), 0),
  );
  const allSelected =
    allFiles.length > 0 && selectedFiles.length === allFiles.length;

  const download = async () => {
    setDownloadRequest('inProgress');
    try {
      const parent = directory.name.split(separator).slice(0, -1).join(separator);
      const prefix = directory.name + separator;

      // group selected files by their first path segment beneath this directory
      const groups = new Map<string, QualifiedFile[]>();
      for (const file of selectedFiles) {
        const relative = file.filename.startsWith(prefix)
          ? file.filename.slice(prefix.length)
          : file.filename;
        const parts = relative.split(separator).filter(Boolean);
        const group = parts.length > 1 ? parts[0] : '';
        const bucket = groups.get(group);
        if (bucket) bucket.push(file);
        else groups.set(group, [file]);
      }

      // files sitting directly in this directory keep the plain download path
      const rootFiles = groups.get('') ?? [];
      if (rootFiles.length > 0) {
        await transfers.download({
          files: rootFiles.map(({ filename, size }) => ({ filename, size })),
          username,
        });
      }

      // each subdirectory becomes a batch rooted at a structure-preserving
      // destination relative to the configured download directory
      for (const [dirName, dirFiles] of groups) {
        if (dirName === '') continue;
        const destination = (prefix + dirName)
          .slice(parent.length > 0 ? parent.length + 1 : 0)
          .split(separator)
          .join('/');
        await transfers.enqueueBatch({
          files: dirFiles.map(({ filename, size }) => ({ filename, size })),
          options: { destination },
          username,
        });
      }

      setDownloadRequest('complete');
    } catch (error) {
      setDownloadError((error as { response: DownloadError }).response);
      setDownloadRequest('error');
    }
  };

  return (
    <Card className="result-card">
      <CardContent>
        <div style={{ marginTop: marginTop ?? 0 }}>
          <div className={locked ? 'muted' : ''}>
            <div className="filelist-header flex items-center gap-2 py-1 text-sm font-medium">
              {locked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <FolderOpen className="h-4 w-4" />
              )}
              {directory.name}
              <button
                className="close-button ml-auto text-red-500"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {allFiles.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="filelist-selector w-8">
                      <Checkbox
                        checked={allSelected}
                        disabled={downloadRequest === 'inProgress'}
                        onCheckedChange={(checked) =>
                          toggleMany(
                            allFiles.map((f) => f.filename),
                            Boolean(checked),
                          )
                        }
                      />
                    </TableHead>
                    <TableHead className="filelist-filename">
                      {childDirs.length > 0 ? 'Name' : 'File'}
                    </TableHead>
                    <TableHead className="filelist-size">Size</TableHead>
                    <TableHead className="filelist-attributes">
                      Attributes
                    </TableHead>
                    <TableHead className="filelist-length">Length</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childDirs.map((child) => {
                    const childFiles = filesByChild.get(child.name) ?? [];
                    const childSelected =
                      childFiles.length > 0 &&
                      childFiles.every((f) => selected.has(f.filename));
                    const childSize = childFiles.reduce(
                      (sum, f) => sum + (f.size ?? 0),
                      0,
                    );

                    return (
                      <TableRow
                        className="browse-folderlist-row cursor-pointer"
                        key={child.name}
                        onClick={() => onNavigate?.(child)}
                      >
                        <TableCell
                          className="filelist-selector"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Checkbox
                            checked={childSelected}
                            disabled={downloadRequest === 'inProgress'}
                            onCheckedChange={(checked) =>
                              toggleMany(
                                childFiles.map((f) => f.filename),
                                Boolean(checked),
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="filelist-filename">
                          <Folder className="mr-1 inline h-3 w-3" />
                          {child.name.split(separator).pop()}
                          <span className="browse-folderlist-caption ml-2 text-muted-foreground">
                            {formatCaption(
                              childFiles.length,
                              countDirectories(child),
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="filelist-size">
                          {formatBytes(childSize)}
                        </TableCell>
                        <TableCell className="filelist-attributes" />
                        <TableCell className="filelist-length" />
                      </TableRow>
                    );
                  })}
                  {rootFiles.map((f) => (
                    <TableRow key={f.filename}>
                      <TableCell className="filelist-selector">
                        <Checkbox
                          checked={selected.has(f.filename)}
                          disabled={downloadRequest === 'inProgress'}
                          onCheckedChange={(checked) =>
                            toggleMany([f.filename], Boolean(checked))
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
              </Table>
            )}
          </div>
        </div>
      </CardContent>
      {selectedFiles.length > 0 && (
        <CardContent className="flex items-center gap-3">
          <Button
            disabled={downloadRequest === 'inProgress'}
            onClick={download}
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Download
            <span className="ml-1 text-muted-foreground">
              {`${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'}, ${selectedSize}`}
            </span>
          </Button>
          {downloadRequest === 'inProgress' && (
            <Loader2 className="h-5 w-5 animate-spin" />
          )}
          {downloadRequest === 'complete' && (
            <Check className="h-5 w-5 text-good" />
          )}
          {downloadRequest === 'error' && (
            <span className="flex items-center gap-1 text-sm text-red-500">
              <X className="h-4 w-4" />
              {downloadError?.data +
                ` (HTTP ${downloadError?.status} ${downloadError?.statusText})`}
            </span>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default Directory;
