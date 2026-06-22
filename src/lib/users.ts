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

export type UserInfo = {
  description: string;
  hasPicture: boolean;
  picture: string;
  queueLength: number;
  uploadSlots: number;
  username: string;
};

export type UserStatus = {
  presence: 'Online' | 'Away' | 'Offline';
};

export type UserEndpoint = {
  address: string;
  port: number;
};

export const getInfo = ({ username }: { username: string }) =>
  api.get<UserInfo>(`/users/${encodeURIComponent(username)}/info`);

export const getStatus = ({ username }: { username: string }) =>
  api.get<UserStatus>(`/users/${encodeURIComponent(username)}/status`);

export const getEndpoint = ({ username }: { username: string }) =>
  api.get<UserEndpoint>(`/users/${encodeURIComponent(username)}/endpoint`);

export type BrowseResponse = {
  directories: UserDirectory[];
  lockedDirectories: UserDirectory[];
};

export const browse = async ({
  username,
}: {
  username: string;
}): Promise<BrowseResponse> =>
  (await api.get<BrowseResponse>(`/users/${encodeURIComponent(username)}/browse`)).data;

export const getBrowseStatus = ({ username }: { username: string }) =>
  api.get<number>(`/users/${encodeURIComponent(username)}/browse/status`);

export const getDirectoryContents = async ({
  username,
  directory,
}: {
  directory: string;
  username: string;
}): Promise<UserDirectory[]> =>
  (
    await api.post<UserDirectory[]>(
      `/users/${encodeURIComponent(username)}/directory`,
      { directory },
    )
  ).data;
