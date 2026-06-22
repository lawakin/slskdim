import api from './api';

export type FilesystemFile = {
  attributes: number;
  createdAt: string;
  fullName: string;
  length: number;
  modifiedAt: string;
  name: string;
};

export type FilesystemDirectory = {
  attributes: number;
  createdAt: string;
  directories: FilesystemDirectory[];
  files: FilesystemFile[];
  fullName: string;
  modifiedAt: string;
  name: string;
};

export const list = async ({
  root,
  subdirectory = '',
}: {
  root: string;
  subdirectory?: string;
}): Promise<FilesystemDirectory> => {
  const response = await api.get(
    `/files/${root}/directories/${btoa(subdirectory)}`,
  );
  return response.data;
};

export const deleteDirectory = async ({
  path,
  root,
}: {
  path: string;
  root: string;
}): Promise<void> => {
  await api.delete(`/files/${root}/directories/${btoa(path)}`);
};

export const deleteFile = async ({
  path,
  root,
}: {
  path: string;
  root: string;
}): Promise<void> => {
  await api.delete(`/files/${root}/files/${btoa(path)}`);
};
