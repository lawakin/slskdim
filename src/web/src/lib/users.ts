import api from './api';

export type UserDirectoryFile = {
  extension: string;
  filename: string;
  size: number;
};

export type UserDirectory = {
  fileCount: number;
  files: UserDirectoryFile[];
  name: string;
};

export const getInfo = ({ username }: { username: string }) =>
  api.get(`/users/${encodeURIComponent(username)}/info`);

export const getStatus = ({ username }: { username: string }) =>
  api.get(`/users/${encodeURIComponent(username)}/status`);

export const getEndpoint = ({ username }: { username: string }) =>
  api.get(`/users/${encodeURIComponent(username)}/endpoint`);

export type BrowseResponse = {
  directories: UserDirectory[];
  lockedDirectories: UserDirectory[];
};

export const browse = async ({ username }: { username: string }): Promise<BrowseResponse> =>
  (await api.get(`/users/${encodeURIComponent(username)}/browse`)).data;

export const getBrowseStatus = ({ username }: { username: string }) =>
  api.get(`/users/${encodeURIComponent(username)}/browse/status`);

export const getDirectoryContents = async ({
  username,
  directory,
}: {
  username: string;
  directory: string;
}): Promise<UserDirectory[]> =>
  (
    await api.post(`/users/${encodeURIComponent(username)}/directory`, {
      directory,
    })
  ).data;
