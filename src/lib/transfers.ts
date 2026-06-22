import {
  type TransferDirection,
  type TransferFile,
  type TransferState,
  type TransferUser,
} from '../types';
import api from './api';

export const getAll = async ({
  direction,
}: {
  direction: TransferDirection | Lowercase<TransferDirection>;
}): Promise<TransferUser[] | undefined> => {
  const response = (
    await api.get(`/transfers/${encodeURIComponent(direction)}s`)
  ).data;

  if (!Array.isArray(response)) {
    console.warn('got non-array response from transfers API', response);
    return undefined;
  }

  return response as TransferUser[];
};

export const download = ({
  username,
  files = [],
}: {
  files?: Array<Pick<TransferFile, 'filename' | 'size'>>;
  username: string;
}) => api.post(`/transfers/downloads/${encodeURIComponent(username)}`, files);

export const cancel = ({
  direction,
  username,
  id,
  remove = false,
}: {
  direction: string;
  id: string;
  remove?: boolean;
  username: string;
}) =>
  api.delete(
    `/transfers/${direction}s/${encodeURIComponent(username)}/${encodeURIComponent(id)}?remove=${remove}`,
  );

export const clearCompleted = ({ direction }: { direction: string }) =>
  api.delete(`/transfers/${direction}s/all/completed`);

export const getPlaceInQueue = ({
  username,
  id,
}: {
  id: string;
  username: string;
}) =>
  api.get(
    `/transfers/downloads/${encodeURIComponent(username)}/${encodeURIComponent(id)}/position`,
  );

export const isStateRetryable = (state: TransferState) =>
  state.includes('Completed') && state !== 'Completed, Succeeded';

export const isStateCancellable = (state: TransferState) =>
  (
    [
      'InProgress',
      'Requested',
      'Queued',
      'Queued, Remotely',
      'Queued, Locally',
      'Initializing',
    ] as TransferState[]
  ).includes(state);

export const isStateRemovable = (state: TransferState) =>
  state.includes('Completed');
