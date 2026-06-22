import * as transfers from '../../lib/transfers';
import { type TransferFile, type TransferUser } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import TransferList from './TransferList';
import { ChevronDown, ChevronRight, Redo, Trash, X } from 'lucide-react';
import { useState } from 'react';

const handleRetry = async (file: TransferFile) => {
  const { filename, size, username } = file;
  try {
    await transfers.download({ files: [{ filename, size }], username });
  } catch (error) {
    console.error(error);
  }
};

const handleRetryAll = async (selected: TransferFile[]) => {
  await Promise.all(selected.map((file) => handleRetry(file)));
};

const handleFetchPlaceInQueue = async (file: TransferFile) => {
  const { id, username } = file;
  try {
    await transfers.getPlaceInQueue({ id, username });
  } catch (error) {
    console.error(error);
  }
};

const TransferGroup = ({
  direction,
  user,
}: {
  readonly direction: string;
  readonly user: TransferUser;
}) => {
  const [isFolded, setIsFolded] = useState(false);
  const [selections, setSelections] = useState<Set<string>>(new Set());

  const handleSelectionChange = (
    directoryName: string,
    file: TransferFile,
    selected: boolean,
  ) => {
    const key = JSON.stringify({
      directory: directoryName,
      filename: file.filename,
    });
    setSelections((previous) => {
      const next = new Set(previous);
      if (selected) {
        next.add(key);
      } else {
        next.delete(key);
      }

      return next;
    });
  };

  const isSelected = (directoryName: string, file: TransferFile) =>
    selections.has(
      JSON.stringify({ directory: directoryName, filename: file.filename }),
    );

  const getSelectedFiles = () =>
    Array.from(selections)
      .map((s) => JSON.parse(s))
      .map((s) =>
        user.directories
          .find((d) => d.directory === s.directory)
          ?.files.find((f) => f.filename === s.filename),
      )
      .filter((s) => s !== undefined);

  const removeFileSelection = (file: TransferFile) => {
    setSelections((previous) => {
      const next = new Set(previous);
      const match = Array.from(next)
        .map((s) => JSON.parse(s))
        .find((s) => s.filename === file.filename);
      if (match) {
        next.delete(JSON.stringify(match));
      }

      return next;
    });
  };

  const handleCancelAll = async (selected: TransferFile[]) => {
    await Promise.all(
      selected.map((file) =>
        transfers.cancel({ direction, id: file.id, username: user.username }),
      ),
    );
  };

  const handleRemoveAll = async (selected: TransferFile[]) => {
    await Promise.all(
      selected.map((file) =>
        transfers
          .cancel({
            direction,
            id: file.id,
            remove: true,
            username: user.username,
          })
          .then(() => removeFileSelection(file)),
      ),
    );
  };

  const selectedFile = getSelectedFiles();
  const all = selectedFile.length > 1 ? ' Selected' : '';

  const allRetryable =
    selectedFile.filter((f) => transfers.isStateRetryable(f.state)).length ===
    selectedFile.length;
  const anyCancellable = selectedFile.some((f) =>
    transfers.isStateCancellable(f.state),
  );
  const allRemovable =
    selectedFile.filter((f) => transfers.isStateRemovable(f.state)).length ===
    selectedFile.length;

  return (
    <Card
      className="transfer-card"
      key={user.username}
    >
      <CardContent>
        <CardHeader className="flex">
          <button
            onClick={() => setIsFolded(!isFolded)}
            type="button"
          >
            {isFolded ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {user.username}
        </CardHeader>
        {user.directories &&
          !isFolded &&
          user.directories.map((directory) => (
            <TransferList
              directoryName={directory.directory}
              files={(directory.files || []).map((f) => ({
                ...f,
                selected: isSelected(directory.directory, f),
              }))}
              key={directory.directory}
              onPlaceInQueueRequested={handleFetchPlaceInQueue}
              onRetryRequested={handleRetry}
              onSelectionChange={handleSelectionChange}
            />
          ))}
      </CardContent>
      {selectedFile && selectedFile.length > 0 && (
        <CardContent>
          <div className="flex">
            {allRetryable && (
              <Button onClick={() => handleRetryAll(selectedFile)}>
                <Redo />
                Retry{all}
              </Button>
            )}
            {allRetryable && anyCancellable && (
              <div className="flex items-center px-1 text-xs text-muted-foreground">
                or
              </div>
            )}
            {anyCancellable && (
              <Button onClick={() => handleCancelAll(selectedFile)}>
                <X />
                Cancel{all}
              </Button>
            )}
            {(allRetryable || anyCancellable) && allRemovable && (
              <div className="flex items-center px-1 text-xs text-muted-foreground">
                or
              </div>
            )}
            {allRemovable && (
              <Button
                // icon="trash alternate"
                onClick={() => handleRemoveAll(selectedFile)}
              >
                <Trash />
                Remove{all}
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default TransferGroup;
