import { isStateCancellable, isStateRetryable } from '../../lib/transfers';
import { type TransferFile, type TransferUser } from '../../types';
import { Div, Nbsp } from '../Shared';
import ShrinkableDropdownButton from '../Shared/ShrinkableDropdownButton';
import { Download, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type Direction = 'upload' | 'download';

const getRetryableFiles = ({
  files,
  retryOption,
}: {
  files: TransferFile[];
  retryOption: string;
}) => {
  switch (retryOption) {
    case 'Errored':
      return files.filter((file) =>
        [
          'Completed, TimedOut',
          'Completed, Errored',
          'Completed, Rejected',
        ].includes(file.state),
      );
    case 'Cancelled':
      return files.filter((file) => file.state === 'Completed, Cancelled');
    case 'All':
      return files.filter((file) => isStateRetryable(file.state));
    default:
      return [];
  }
};

const getCancellableFiles = ({
  cancelOption,
  files,
}: {
  cancelOption: string;
  files: TransferFile[];
}) => {
  switch (cancelOption) {
    case 'All':
      return files.filter((file) => isStateCancellable(file.state));
    case 'Queued':
      return files.filter((file) =>
        ['Queued, Locally', 'Queued, Remotely'].includes(file.state),
      );
    case 'In Progress':
      return files.filter((file) => file.state === 'InProgress');
    default:
      return [];
  }
};

const getRemovableFiles = ({
  files,
  removeOption,
}: {
  files: TransferFile[];
  removeOption: string;
}) => {
  switch (removeOption) {
    case 'Succeeded':
      return files.filter((file) => file.state === 'Completed, Succeeded');
    case 'Errored':
      return files.filter((file) =>
        [
          'Completed, TimedOut',
          'Completed, Errored',
          'Completed, Rejected',
        ].includes(file.state),
      );
    case 'Cancelled':
      return files.filter((file) => file.state === 'Completed, Cancelled');
    case 'Completed':
      return files.filter((file) => file.state.includes('Completed'));
    default:
      return [];
  }
};

const TransfersHeader = ({
  cancelling = false,
  direction,
  onCancelAll,
  onRemoveAll,
  onRetryAll,
  removing = false,
  retrying = false,
  server = { isConnected: true },
  transfers,
}: {
  readonly cancelling?: boolean;
  readonly direction: Direction;
  readonly onCancelAll: (files: TransferFile[]) => void;
  readonly onRemoveAll: (files: TransferFile[]) => void;
  readonly onRetryAll: (files: TransferFile[]) => void;
  readonly removing?: boolean;
  readonly retrying?: boolean;
  readonly server?: { isConnected: boolean };
  readonly transfers: TransferUser[];
}) => {
  const [removeOption, setRemoveOption] = useState('Succeeded');
  const [cancelOption, setCancelOption] = useState('All');
  const [retryOption, setRetryOption] = useState('Errored');

  const files = useMemo(
    () =>
      transfers
        .flatMap((user) => user.directories.flatMap((d) => d.files))
        .filter((file) => file.direction.toLowerCase() === direction),
    [direction, transfers],
  );

  const empty = files.length === 0;
  const working = retrying || cancelling || removing;
  const DirectionIcon = direction === 'upload' ? Upload : Download;

  return (
    <div className="transfers-header-segment">
      <div className="transfers-segment-icon">
        <DirectionIcon className="h-8 w-8" />
      </div>
      <Div
        className="transfers-header-buttons"
        hidden={empty}
      >
        <ShrinkableDropdownButton
          color="green"
          disabled={working || empty || !server.isConnected}
          hidden={direction === 'upload'}
          icon={<RotateCcw className="h-4 w-4" />}
          loading={retrying}
          mediaQuery="(max-width: 715px)"
          onChange={(value) => setRetryOption(value as string)}
          onClick={() => onRetryAll(getRetryableFiles({ files, retryOption }))}
          options={[
            { key: 'errored', text: 'Errored', value: 'Errored' },
            { key: 'cancelled', text: 'Cancelled', value: 'Cancelled' },
            { key: 'all', text: 'All', value: 'All' },
          ]}
        >
          {`Retry ${retryOption === 'All' ? retryOption : `All ${retryOption}`}`}
        </ShrinkableDropdownButton>
        <Nbsp />
        <ShrinkableDropdownButton
          color="red"
          disabled={working || empty}
          icon={<X className="h-4 w-4" />}
          loading={cancelling}
          mediaQuery="(max-width: 715px)"
          onChange={(value) => setCancelOption(value as string)}
          onClick={() =>
            onCancelAll(getCancellableFiles({ cancelOption, files }))
          }
          options={[
            { key: 'all', text: 'All', value: 'All' },
            { key: 'queued', text: 'Queued', value: 'Queued' },
            { key: 'inProgress', text: 'In Progress', value: 'In Progress' },
          ]}
        >
          {`Cancel ${cancelOption === 'All' ? cancelOption : `All ${cancelOption}`}`}
        </ShrinkableDropdownButton>
        <Nbsp />
        <ShrinkableDropdownButton
          disabled={working || empty}
          icon={<Trash2 className="h-4 w-4" />}
          loading={removing}
          mediaQuery="(max-width: 715px)"
          onChange={(value) => setRemoveOption(value as string)}
          onClick={() =>
            onRemoveAll(getRemovableFiles({ files, removeOption }))
          }
          options={[
            { key: 'succeeded', text: 'Succeeded', value: 'Succeeded' },
            { key: 'errored', text: 'Errored', value: 'Errored' },
            { key: 'cancelled', text: 'Cancelled', value: 'Cancelled' },
            { key: 'completed', text: 'Completed', value: 'Completed' },
          ]}
        >
          {`Remove All ${removeOption}`}
        </ShrinkableDropdownButton>
      </Div>
    </div>
  );
};

export default TransfersHeader;
