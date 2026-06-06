import api from './api';

// SearchStates is a Soulseek.NET flags enum serialized as a number.
// Common values: 0=None, 1=Requested, 2=InProgress, 4=Completed,
// 8=Cancelled, 16=Errored, 32=TimedOut. Combine with bitwise OR.
export type SearchStates = number;

export type SearchFile = {
  bitDepth: number | null;
  bitRate: number | null;
  code: number;
  extension: string;
  filename: string;
  isLocked: boolean;
  isVariableBitRate: boolean | null;
  length: number | null;
  sampleRate: number | null;
  size: number;
};

export type SearchResponse = {
  fileCount: number;
  files: SearchFile[];
  hasFreeUploadSlot: boolean;
  lockedFileCount: number;
  lockedFiles: SearchFile[];
  queueLength: number;
  token: number;
  uploadSpeed: number;
  username: string;
};

export type Search = {
  endedAt: string | null;
  fileCount: number;
  id: string;
  isComplete: boolean;
  lockedFileCount: number;
  responseCount: number;
  responses: SearchResponse[];
  searchText: string;
  startedAt: string;
  state: string;
  token: number;
};

export type SearchFilters = {
  exclude: string[];
  include: string[];
  isCBR: boolean;
  isLossless: boolean;
  isLossy: boolean;
  isVBR: boolean;
  minBitDepth: number;
  minBitRate: number;
  minFileSize: number;
  minFilesInFolder: number;
  minLength: number;
};

export const getAll = async (): Promise<Search[]> =>
  (await api.get('/searches')).data;

export const stop = ({ id }: { id: string }): Promise<void> =>
  api.put(`/searches/${encodeURIComponent(id)}`);

export const remove = ({ id }: { id: string }): Promise<void> =>
  api.delete(`/searches/${encodeURIComponent(id)}`);

export const create = ({
  id,
  searchText,
}: {
  id: string;
  searchText: string;
}): Promise<void> => api.post('/searches', { id, searchText });

export const getStatus = async ({
  id,
  includeResponses = false,
}: {
  id: string;
  includeResponses?: boolean;
}): Promise<Search> =>
  (
    await api.get(
      `/searches/${encodeURIComponent(id)}?includeResponses=${includeResponses}`,
    )
  ).data;

export const getResponses = async ({
  id,
}: {
  id: string;
}): Promise<SearchResponse[] | undefined> => {
  const response = (
    await api.get(`/searches/${encodeURIComponent(id)}/responses`)
  ).data;

  if (!Array.isArray(response)) {
    console.warn('got non-array response from searches API', response);
    return undefined;
  }

  return response;
};

const getNthMatch = (
  string: string,
  regex: RegExp,
  n: number,
): number | undefined => {
  const match = string.match(regex);
  if (match) return Number.parseInt(match[n], 10);
  return undefined;
};

export const parseFiltersFromString = (string: string): SearchFilters => {
  const filters: SearchFilters = {
    exclude: [],
    include: [],
    isCBR: false,
    isLossless: false,
    isLossy: false,
    isVBR: false,
    minBitDepth: 0,
    minBitRate: 0,
    minFilesInFolder: 0,
    minFileSize: 0,
    minLength: 0,
  };

  filters.minBitRate =
    getNthMatch(string, /(minbr|minbitrate):(\d+)/iu, 2) ?? filters.minBitRate;
  filters.minBitDepth =
    getNthMatch(string, /(minbd|minbitdepth):(\d+)/iu, 2) ??
    filters.minBitDepth;
  filters.minFileSize =
    getNthMatch(string, /(minfs|minfilesize):(\d+)/iu, 2) ??
    filters.minFileSize;
  filters.minLength =
    getNthMatch(string, /(minlen|minlength):(\d+)/iu, 2) ?? filters.minLength;
  filters.minFilesInFolder =
    getNthMatch(string, /(minfif|minfilesinfolder):(\d+)/iu, 2) ??
    filters.minFilesInFolder;

  filters.isVBR = /isvbr/iu.test(string);
  filters.isCBR = /iscbr/iu.test(string);
  filters.isLossless = /islossless/iu.test(string);
  filters.isLossy = /islossy/iu.test(string);

  const terms = string
    .toLowerCase()
    .split(' ')
    .filter(
      (term) =>
        !term.includes(':') &&
        term !== 'isvbr' &&
        term !== 'iscbr' &&
        term !== 'islossless' &&
        term !== 'islossy',
    );

  filters.include = terms.filter((term) => !term.startsWith('-'));
  filters.exclude = terms
    .filter((term) => term.startsWith('-'))
    .map((term) => term.slice(1));

  return filters;
};

const matchesTypeFilters = (
  file: SearchFile,
  filters: SearchFilters,
): boolean => {
  const { isVariableBitRate, sampleRate, bitDepth } = file;
  const { isCBR, isVBR, isLossless, isLossy } = filters;
  if (isCBR && (isVariableBitRate === undefined || isVariableBitRate))
    return false;
  if (isVBR && (isVariableBitRate === undefined || !isVariableBitRate))
    return false;
  if (isLossless && (!sampleRate || !bitDepth)) return false;
  if (isLossy && (sampleRate || bitDepth)) return false;
  return true;
};

export const filterResponse = ({
  filters = {
    exclude: [],
    include: [],
    isCBR: false,
    isLossless: false,
    isLossy: false,
    isVBR: false,
    minBitDepth: 0,
    minBitRate: 0,
    minFilesInFolder: 0,
    minFileSize: 0,
    minLength: 0,
  },
  response,
}: {
  filters?: SearchFilters;
  response: SearchResponse;
}): SearchResponse => {
  const { files = [], lockedFiles = [] } = response;

  if (
    response.fileCount + response.lockedFileCount <
    filters.minFilesInFolder
  ) {
    return { ...response, files: [] };
  }

  const filterFiles = (filesToFilter: SearchFile[]) =>
    filesToFilter.filter((file) => {
      const { bitRate, size, length, filename, bitDepth } = file;
      const {
        minBitRate,
        minBitDepth,
        minFileSize,
        minLength,
        include,
        exclude,
      } = filters;

      if (!matchesTypeFilters(file, filters)) return false;
      if ((bitRate ?? 0) < minBitRate) return false;
      if ((bitDepth ?? 0) < minBitDepth) return false;
      if (size < minFileSize) return false;
      if ((length ?? 0) < minLength) return false;

      if (
        include.length > 0 &&
        include.filter((term) => filename.toLowerCase().includes(term))
          .length !== include.length
      )
        return false;

      if (exclude.some((term) => filename.toLowerCase().includes(term)))
        return false;

      return true;
    });

  const filteredFiles = filterFiles(files);
  const filteredLockedFiles = filterFiles(lockedFiles);

  return {
    ...response,
    fileCount: filteredFiles.length,
    files: filteredFiles,
    lockedFileCount: filteredLockedFiles.length,
    lockedFiles: filteredLockedFiles,
  };
};
