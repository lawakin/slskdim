import api from './api';

export type Share = {
  alias: string;
  directories: number | null;
  files: number | null;
  id: string;
  isExcluded: boolean;
  localPath: string;
  raw: string;
  remotePath: string;
};

export type ShareFileAttribute = {
  type: number;
  value: number;
};

export type ShareFile = {
  attributes: ShareFileAttribute[];
  extension: string;
  filename: string;
  index: number;
  size: number;
};

export type BrowseDirectory = {
  fileCount: number;
  files: ShareFile[];
  name: string;
};

export const getAll = async (): Promise<Record<string, Share[]>> =>
  (await api.get('/shares')).data;

export const get = async ({ id }: { id: string }): Promise<Share> => {
  if (!id) throw new Error('unable to get share: id is missing');
  return (await api.get(`/shares/${encodeURIComponent(id)}`)).data;
};

export const browseAll = async (): Promise<BrowseDirectory[]> =>
  (await api.get('/shares/contents')).data;

export const browse = async ({ id }: { id: string }): Promise<BrowseDirectory[]> => {
  if (!id) throw new Error('unable to get share contents: id is missing');
  return (await api.get(`/shares/${encodeURIComponent(id)}/contents`)).data;
};

export const rescan = async (): Promise<void> => {
  await api.put('/shares');
};

export const cancel = async (): Promise<void> => {
  await api.delete('/shares');
};
