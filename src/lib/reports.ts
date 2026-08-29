import api from './api';

export type TransferDirection = 'Upload' | 'Download';

// One row of aggregate stats for a single transfer state (e.g. Succeeded,
// Errored) within a direction. Shapes are whatever the telemetry backend emits;
// fields are optional because older/partial payloads omit them.
export type TransferStat = {
  averageSpeed?: number;
  averageWait?: number;
  count?: number;
  distinctUsers?: number;
  totalBytes?: number;
};

// keyed by transfer state
export type DirectionSummary = Record<string, TransferStat>;

export type ReportsSummary = Partial<
  Record<TransferDirection, DirectionSummary>
>;

// keyed by ISO timestamp -> direction -> state
export type ReportsHistogram = Record<
  string,
  Partial<Record<TransferDirection, DirectionSummary>>
>;

export type LeaderboardRow = {
  averageSpeed: number;
  count: number;
  totalBytes: number;
  username: string;
};

export type DirectoryRow = {
  count: number;
  directory: string;
  distinctUsers: number;
};

export type ExceptionRow = {
  direction?: string;
  endedAt: string;
  exception: string;
  filename: string;
  username: string;
};

export type ParetoRow = {
  count: number;
  direction?: string;
  distinctUsers: number;
  exception: string;
};

type Range = {
  direction?: TransferDirection;
  end?: Date;
  start?: Date;
  username?: string | null;
};

export const getSummary = async ({
  start,
  end,
  direction,
  username = null,
}: Range = {}): Promise<ReportsSummary> => {
  const parameters = new URLSearchParams();

  if (start) parameters.append('start', start.toISOString());
  if (end) parameters.append('end', end.toISOString());
  if (direction) parameters.append('direction', direction);
  if (username) parameters.append('username', username);

  return (
    await api.get<ReportsSummary>(
      `/telemetry/reports/transfers/summary?${parameters}`,
    )
  ).data;
};

export const getHistogram = async ({
  start,
  end,
  buckets,
  direction,
  username = null,
}: Range & { buckets?: number } = {}): Promise<ReportsHistogram> => {
  const parameters = new URLSearchParams();

  if (start) parameters.append('start', start.toISOString());
  if (end) parameters.append('end', end.toISOString());
  if (buckets) parameters.append('buckets', String(buckets));
  if (direction) parameters.append('direction', direction);
  if (username) parameters.append('username', username);

  return (
    await api.get<ReportsHistogram>(
      `/telemetry/reports/transfers/histogram?${parameters}`,
    )
  ).data;
};

export const getLeaderboard = async ({
  direction,
  start,
  end,
  sortBy = 'Count',
  sortOrder = 'DESC',
  limit = 10,
  offset = 0,
}: Range & {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
} = {}): Promise<LeaderboardRow[]> => {
  const parameters = new URLSearchParams();

  if (direction) parameters.append('direction', direction);
  if (start) parameters.append('start', start.toISOString());
  if (end) parameters.append('end', end.toISOString());

  parameters.append('sortBy', sortBy);
  parameters.append('sortOrder', sortOrder);
  parameters.append('limit', String(limit));
  parameters.append('offset', String(offset));

  return (
    await api.get<LeaderboardRow[]>(
      `/telemetry/reports/transfers/leaderboard?${parameters}`,
    )
  ).data;
};

export const getTopDirectories = async ({
  start,
  end,
  username = null,
  limit = 10,
  offset = 0,
}: Range & { limit?: number; offset?: number } = {}): Promise<DirectoryRow[]> => {
  const parameters = new URLSearchParams();

  if (start) parameters.append('start', start.toISOString());
  if (end) parameters.append('end', end.toISOString());
  if (username) parameters.append('username', username);

  parameters.append('limit', String(limit));
  parameters.append('offset', String(offset));

  return (
    await api.get<DirectoryRow[]>(
      `/telemetry/reports/transfers/directories?${parameters}`,
    )
  ).data;
};

export const getExceptions = async ({
  direction,
  start,
  end,
  username,
  sortOrder = 'DESC',
  limit = 10,
  offset = 0,
}: Range & {
  limit?: number;
  offset?: number;
  sortOrder?: 'ASC' | 'DESC';
} = {}): Promise<ExceptionRow[]> => {
  const parameters = new URLSearchParams();

  if (direction) parameters.append('direction', direction);
  if (start) parameters.append('start', start.toISOString());
  if (end) parameters.append('end', end.toISOString());
  if (username) parameters.append('username', username);

  parameters.append('sortOrder', sortOrder);
  parameters.append('limit', String(limit));
  parameters.append('offset', String(offset));

  return (
    await api.get<ExceptionRow[]>(
      `/telemetry/reports/transfers/exceptions?${parameters}`,
    )
  ).data;
};

export const getExceptionPareto = async ({
  direction,
  start,
  end,
  username = null,
  limit = 10,
  offset = 0,
}: Range & { limit?: number; offset?: number } = {}): Promise<ParetoRow[]> => {
  const parameters = new URLSearchParams();

  if (direction) parameters.append('direction', direction);
  if (start) parameters.append('start', start.toISOString());
  if (end) parameters.append('end', end.toISOString());
  if (username) parameters.append('username', username);

  parameters.append('limit', String(limit));
  parameters.append('offset', String(offset));

  return (
    await api.get<ParetoRow[]>(
      `/telemetry/reports/transfers/exceptions/pareto?${parameters}`,
    )
  ).data;
};
