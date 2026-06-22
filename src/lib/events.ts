import api from './api';

export type AppEvent = {
  data: string;
  id: string;
  timestamp: string;
  type: string;
};

export const list = async ({
  offset,
  limit,
}: {
  limit: number;
  offset: number;
}): Promise<{ events: AppEvent[]; totalCount: number }> => {
  const response = await api.get<AppEvent[]>(
    `/events?offset=${offset}&limit=${limit}`,
  );

  const events = response.data;
  const totalCount = Number(response.headers['x-total-count']);

  return { events, totalCount };
};
