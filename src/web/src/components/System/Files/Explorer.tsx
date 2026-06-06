import {
  deleteDirectory,
  deleteFile,
  type FilesystemDirectory,
  type FilesystemFile,
  list,
} from '../../../lib/files';
import { formatBytes, formatDate } from '../../../lib/util';
import { LoaderSegment } from '../../Shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronDown,
  ChevronUp,
  File,
  Folder,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
// import { Header, Icon, Modal, Table } from 'semantic-ui-react';

const FileRow = ({
  fullName,
  length,
  modifiedAt,
  name,
  onRefresh,
  remoteFileManagement,
  root,
  subdirectory,
}: FilesystemFile & {
  readonly onRefresh: () => void;
  readonly remoteFileManagement: boolean;
  readonly root: string;
  readonly subdirectory: string[];
}) => {
  const handleDelete = async () => {
    await deleteFile({ path: `${subdirectory.join('/')}/${fullName}`, root });
    onRefresh();
  };

  return (
    <TableRow key={fullName}>
      <TableCell>
        <File />
        {name}
      </TableCell>
      <TableCell>{modifiedAt ? formatDate(modifiedAt) : ''}</TableCell>
      <TableCell>{length ? formatBytes(length) : ''}</TableCell>
      <TableCell>
        {remoteFileManagement ? (
          /* <Modal */
          /*   actions={[ */
          /*     'Cancel', */
          /*     { */
          /*       content: 'Delete', */
          /*       key: 'done', */
          /*       negative: true, */
          /*       onClick: async () => { */
          /*         await deleteFile({ */
          /*           path: `${subdirectory.join('/')}/${fullName}`, */
          /*           root, */
          /*         }); */
          /*         fetch(); */
          /*       }, */
          /*     }, */
          /*   ]} */
          /*   centered */
          /*   content={`Are you sure you want to delete file '${fullName}'?`} */
          /*   header={ */
          /*     <Header */
          /*       content="Confirm File Delete" */
          /*       icon="trash alternate" */
          /*     /> */
          /*   } */
          /*   size="small" */
          /*   trigger={ */
          /*     <Icon */
          /*       className="clickable" */
          /*       color="red" */
          /*       name="trash alternate" */
          /*     /> */
          /*   } */
          /* /> */
          <Dialog>
            <DialogTrigger>
              <Trash2 className="h-4 w-4 cursor-pointer text-red-500" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm File Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete '{fullName}'?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </TableCell>
    </TableRow>
  );
};

const DirectoryRow = ({
  deletable = true,
  directory,
  onClick = () => {},
  onRefresh,
  remoteFileManagement,
  root,
  subdirectory,
}: {
  readonly deletable?: boolean;
  readonly directory: FilesystemDirectory;
  readonly onClick?: () => void;
  readonly onRefresh: () => void;
  readonly remoteFileManagement: boolean;
  readonly root: string;
  readonly subdirectory: string[];
}) => {
  const { fullName, modifiedAt, name } = directory;

  const handleDelete = async () => {
    await deleteDirectory({
      path: `${subdirectory.join('/')}/${fullName}`,
      root,
    });
    onRefresh();
  };

  return (
    <TableRow key={name}>
      <TableCell
        className="clickable"
        onClick={onClick}
      >
        <Folder />
        {name}
      </TableCell>
      <TableCell>{modifiedAt ? formatDate(modifiedAt) : ''}</TableCell>
      <TableCell />
      <TableCell>
        {remoteFileManagement && deletable ? (
          <Dialog>
            <DialogTrigger>
              <Trash2 className="h-4 w-4 cursor-pointer text-red-500" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Directory Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete '{fullName}'?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </TableCell>
    </TableRow>
  );
};

const Explorer = ({
  remoteFileManagement,
  root,
}: {
  readonly remoteFileManagement: boolean;
  readonly root: 'downloads' | 'incomplete';
}) => {
  const [directory, setDirectory] = useState<FilesystemDirectory>({
    attributes: 0,
    createdAt: '',
    directories: [],
    files: [],
    fullName: '',
    modifiedAt: '',
    name: '',
  });
  const [subdirectory, setSubdirectory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState<'name' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<
    'ascending' | 'descending'
  >('ascending');

  const fetch = async () => {
    setLoading(true);
    const directoryResult = await list({
      root,
      subdirectory: subdirectory.join('/'),
    });
    setDirectory(directoryResult);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [subdirectory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSubdirectory([]);
  }, [root]);

  const select = ({ path }) => {
    setSubdirectory([...subdirectory, path]);
  };

  const upOneSubdirectory = () => {
    const copy = [...subdirectory];
    copy.pop();
    setSubdirectory(copy);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(
        sortDirection === 'ascending' ? 'descending' : 'ascending',
      );
    } else {
      setSortColumn(column);
      setSortDirection('ascending');
    }
  };

  // ugly ugly generic but gets the job done
  const sortItems = <T extends { modifiedAt: string; name: string }>(
    items: T[],
  ): T[] => {
    if (!items || items.length === 0) return items;

    return [...items].sort((a, b) => {
      let compareValue = 0;

      if (sortColumn === 'name') {
        compareValue = a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      } else if (sortColumn === 'date') {
        const dateA = a.modifiedAt ? new Date(a.modifiedAt) : new Date(0);
        const dateB = b.modifiedAt ? new Date(b.modifiedAt) : new Date(0);
        compareValue = Number(dateA) - Number(dateB);
      }

      return sortDirection === 'ascending' ? compareValue : -compareValue;
    });
  };

  if (loading) {
    return <LoaderSegment />;
  }

  const total = directory?.directories?.length + directory?.files?.length;
  const sortedDirectories = sortItems(directory?.directories);
  const sortedFiles = sortItems(directory?.files);

  return (
    <>
      <h3
        className="explorer-working-directory"
        // size="small"
      >
        <FolderOpen />
        {'/' + root + '/' + subdirectory.join('/')}
      </h3>
      <Table
        className="unstackable"
        // size="large"
      >
        <TableHeader>
          <TableRow>
            <TableHead
              className="explorer-list-name clickable"
              onClick={() => handleSort('name')}
            >
              Name
              {sortColumn === 'name' &&
                (sortDirection === 'ascending' ? (
                  <ChevronUp className="inline h-3 w-3" />
                ) : (
                  <ChevronDown className="inline h-3 w-3" />
                ))}
            </TableHead>
            <TableHead
              className="explorer-list-date clickable"
              onClick={() => handleSort('date')}
            >
              Date Modified
              {sortColumn === 'date' &&
                (sortDirection === 'ascending' ? (
                  <ChevronUp className="inline h-3 w-3" />
                ) : (
                  <ChevronDown className="inline h-3 w-3" />
                ))}
            </TableHead>
            <TableHead className="explorer-list-size">Size</TableHead>
            <TableHead className="explorer-list-action" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {total === 0 ? (
            <TableRow>
              <TableCell
                colSpan={99}
                style={{
                  opacity: 0.5,
                  padding: '10px !important',
                  textAlign: 'center',
                }}
              >
                No files or directories
              </TableCell>
            </TableRow>
          ) : (
            <>
              {subdirectory.length > 0 && (
                <DirectoryRow
                  deletable={false}
                  directory={{
                    attributes: 0,
                    createdAt: '',
                    directories: [],
                    files: [],
                    fullName: '..',
                    modifiedAt: '',
                    name: '..',
                  }}
                  onClick={upOneSubdirectory}
                  onRefresh={fetch}
                  remoteFileManagement={remoteFileManagement}
                  root={root}
                  subdirectory={subdirectory}
                />
              )}
              {sortedDirectories?.map((d) => (
                <DirectoryRow
                  directory={d}
                  key={d.name}
                  onClick={() => select({ path: d.name })}
                  onRefresh={fetch}
                  remoteFileManagement={remoteFileManagement}
                  root={root}
                  subdirectory={subdirectory}
                />
              ))}
              {sortedFiles?.map((f) => (
                <FileRow
                  key={f.name}
                  {...f}
                  onRefresh={fetch}
                  remoteFileManagement={remoteFileManagement}
                  root={root}
                  subdirectory={subdirectory}
                />
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default Explorer;
