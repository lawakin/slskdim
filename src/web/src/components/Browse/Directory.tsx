import * as transfers from '../../lib/transfers';
import { type UserDirectoryFile } from '../../lib/users';
import { formatBytes } from '../../lib/util';
import FileList from '../Shared/FileList';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Check, Download, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type SelectableFile = UserDirectoryFile & { selected: boolean };

type DownloadRequest = 'inProgress' | 'complete' | 'error' | undefined;

type DownloadError = {
  data: string;
  status: number;
  statusText: string;
};

const Directory = ({
  files: filesProperty,
  locked,
  marginTop,
  name,
  onClose,
  username,
}: {
  readonly files: UserDirectoryFile[];
  readonly locked?: boolean;
  readonly marginTop?: number;
  readonly name: string;
  readonly onClose: () => void;
  readonly username: string;
}) => {
  const [downloadError, setDownloadError] = useState<DownloadError | undefined>(
    undefined,
  );
  const [downloadRequest, setDownloadRequest] =
    useState<DownloadRequest>(undefined);
  const [files, setFiles] = useState<SelectableFile[]>(
    filesProperty.map((f) => ({ ...f, selected: false })),
  );

  useEffect(() => {
    setFiles(filesProperty.map((f) => ({ ...f, selected: false })));
    setDownloadError(undefined);
    setDownloadRequest(undefined);
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelectionChange = (file: SelectableFile, state: boolean) => {
    setDownloadError(undefined);
    setDownloadRequest(undefined);
    setFiles((previous) =>
      previous.map((f) => (f === file ? { ...f, selected: state } : f)),
    );
  };

  const download = async (
    targetUsername: string,
    filesToDownload: SelectableFile[],
  ) => {
    setDownloadRequest('inProgress');
    try {
      const requests = filesToDownload.map(({ filename, size }) => ({
        filename,
        size,
      }));
      await transfers.download({ files: requests, username: targetUsername });
      setDownloadRequest('complete');
    } catch (error) {
      setDownloadError((error as { response: DownloadError }).response);
      setDownloadRequest('error');
    }
  };

  const selectedFiles = files.filter((f) => f.selected);
  const selectedSize = formatBytes(
    selectedFiles.reduce((total, f) => total + f.size, 0),
  );

  return (
    <Card className="result-card">
      <CardContent>
        <div style={{ marginTop: marginTop ?? 0 }}>
          <FileList
            directoryName={name}
            disabled={downloadRequest === 'inProgress'}
            files={files}
            locked={locked}
            onClose={onClose}
            onSelectionChange={handleFileSelectionChange}
          />
        </div>
      </CardContent>
      {selectedFiles.length > 0 && (
        <CardContent className="flex items-center gap-3">
          <Button
            disabled={downloadRequest === 'inProgress'}
            onClick={() => download(username, selectedFiles)}
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
            <Check className="h-5 w-5 text-green-500" />
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
