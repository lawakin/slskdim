import { type SearchFile, type SearchResponse } from '../../lib/searches';
import * as transfers from '../../lib/transfers';
import { getDirectoryContents } from '../../lib/users';
import { formatBytes, getDirectoryName } from '../../lib/util';
import FileList from '../Shared/FileList';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type SelectableFile = SearchFile & { locked?: boolean; selected: boolean };
type FileTree = Record<string, SelectableFile[]>;
type DownloadRequest = 'inProgress' | 'complete' | 'error' | undefined;
type DownloadError =
  | { data: string; status: number; statusText: string }
  | undefined;

const buildTree = (response: SearchResponse): FileTree => {
  const lockedFiles = (response.lockedFiles ?? []).map((f) => ({
    ...f,
    locked: true as const,
  }));
  const allFiles = (response.files ?? []).concat(lockedFiles);

  return allFiles.reduce<FileTree>((dict, file) => {
    const directory = getDirectoryName(file.filename);
    const selectable: SelectableFile = { selected: false, ...file };
    dict[directory] =
      dict[directory] === undefined
        ? [selectable]
        : dict[directory].concat(selectable);
    return dict;
  }, {});
};

const Response = ({
  disabled,
  isInitiallyFolded,
  onHide,
  response,
}: {
  readonly disabled: boolean;
  readonly isInitiallyFolded: boolean;
  readonly onHide: () => void;
  readonly response: SearchResponse;
}) => {
  const [downloadError, setDownloadError] = useState<DownloadError>(undefined);
  const [downloadRequest, setDownloadRequest] =
    useState<DownloadRequest>(undefined);
  const [fetchingDirectoryContents, setFetchingDirectoryContents] =
    useState(false);
  const [isFolded, setIsFolded] = useState(isInitiallyFolded);
  const [tree, setTree] = useState<FileTree>(() => buildTree(response));

  useEffect(() => {
    setTree(buildTree(response));
  }, [response]);

  useEffect(() => {
    setIsFolded(isInitiallyFolded);
  }, [isInitiallyFolded]);

  const handleFileSelectionChange = (
    file: SelectableFile,
    selected: boolean,
  ) => {
    setTree((previous) => {
      const directory = getDirectoryName(file.filename);
      return {
        ...previous,
        [directory]: previous[directory].map((f) =>
          f.filename === file.filename ? { ...f, selected } : f,
        ),
      };
    });
    setDownloadError(undefined);
    setDownloadRequest(undefined);
  };

  const download = async (username: string, files: SelectableFile[]) => {
    setDownloadRequest('inProgress');
    try {
      const requests = files.map(({ filename, size }) => ({ filename, size }));
      await transfers.download({ files: requests, username });
      setDownloadRequest('complete');
    } catch (error: unknown) {
      setDownloadError((error as { response: DownloadError })?.response);
      setDownloadRequest('error');
    }
  };

  const getFullDirectory = async (username: string, directory: string) => {
    setFetchingDirectoryContents(true);
    try {
      const oldTree = { ...tree };
      const oldFiles = oldTree[directory];

      try {
        // some clients send subdirectories in the response; the root is always first
        const allDirectories = await getDirectoryContents({
          directory,
          username,
        });
        const theRootDirectory = allDirectories?.[0];

        if (!theRootDirectory) {
          throw new Error('No directories were included in the response');
        }

        const { files, name } = theRootDirectory;

        const fixedFiles = files.map((file) => ({
          ...file,
          filename: `${directory}\\${file.filename}`,
          selected:
            oldFiles.find(
              (f) => f.filename === `${directory}\\${file.filename}`,
            )?.selected ?? false,
        })) as SelectableFile[];

        setTree({ ...oldTree, [name]: fixedFiles });
      } catch (innerError) {
        throw new Error(`Failed to process directory response: ${innerError}`);
      }
    } catch (outerError) {
      console.error(outerError);
      toast.error(
        (outerError as { message?: string; response?: { data?: string } })
          ?.response?.data ??
          (outerError as Error)?.message ??
          String(outerError),
      );
    } finally {
      setFetchingDirectoryContents(false);
    }
  };

  const free = response.hasFreeUploadSlot;

  const selectedFiles = Object.values(tree)
    .flat()
    .filter((f) => f.selected);

  const selectedSize = formatBytes(
    selectedFiles.reduce((total, f) => total + f.size, 0),
  );

  return (
    <Card className="result-card">
      <CardContent>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFolded((previous) => !previous)}
            type="button"
          >
            {isFolded ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <div
            className={`h-2 w-2 rounded-full ${free ? 'bg-green-500' : 'bg-yellow-500'}`}
          />
          <span className="font-medium">{response.username}</span>
          <button
            className="close-button ml-auto text-red-500 hover:text-red-700"
            onClick={onHide}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="result-meta mt-1 text-sm text-muted-foreground">
          Upload Speed: {formatBytes(response.uploadSpeed)}/s, Free Upload Slot:{' '}
          {free ? 'YES' : 'NO'}, Queue Length: {response.queueLength}
        </div>
        {!isFolded &&
          Object.keys(tree).map((directory) => (
            <FileList
              directoryName={directory}
              disabled={downloadRequest === 'inProgress'}
              files={tree[directory]}
              footer={
                <button
                  disabled={fetchingDirectoryContents}
                  onClick={() => getFullDirectory(response.username, directory)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                  type="button"
                >
                  {fetchingDirectoryContents ? (
                    <Loader2 className="inline h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="inline h-4 w-4" />
                  )}{' '}
                  Search for Additional Files in This Directory
                </button>
              }
              key={directory}
              locked={tree[directory].some((file) => file.locked)}
              onSelectionChange={handleFileSelectionChange}
            />
          ))}
      </CardContent>
      {selectedFiles.length > 0 && (
        <CardFooter className="gap-3">
          <Button
            disabled={disabled || downloadRequest === 'inProgress'}
            onClick={() => download(response.username, selectedFiles)}
          >
            <Download className="h-4 w-4" />
            Download
            <span className="ml-1 text-xs opacity-75">
              {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'}
              , {selectedSize}
            </span>
          </Button>
          {downloadRequest === 'inProgress' && (
            <Loader2 className="h-5 w-5 animate-spin" />
          )}
          {downloadRequest === 'complete' && (
            <Check className="h-5 w-5 text-green-500" />
          )}
          {downloadRequest === 'error' && downloadError && (
            <span className="text-sm text-red-500">
              {downloadError.data}
              {` (HTTP ${downloadError.status} ${downloadError.statusText})`}
            </span>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default Response;
