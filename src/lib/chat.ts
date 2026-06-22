import api from './api';

export type ChatMessage = {
  direction: 'In' | 'Out';
  message: string;
  timestamp: string;
  username: string;
};

export type Conversation = {
  hasUnAcknowledgedMessages: boolean;
  messages: ChatMessage[];
  unAcknowledgedMessageCount: number;
  username: string;
};

export const getAll = async (): Promise<Conversation[]> =>
  (await api.get<Conversation[]>('/conversations')).data;

export const get = async ({
  username,
}: {
  username: string;
}): Promise<Conversation> =>
  (
    await api.get<Conversation>(
      `/conversations/${encodeURIComponent(username)}`,
    )
  ).data;

export const acknowledge = ({ username }: { username: string }) =>
  api.put(`/conversations/${encodeURIComponent(username)}`);

export const send = ({
  username,
  message,
}: {
  message: string;
  username: string;
}) =>
  api.post(
    `/conversations/${encodeURIComponent(username)}`,
    JSON.stringify(message),
  );

export const remove = ({ username }: { username: string }) =>
  api.delete(`/conversations/${encodeURIComponent(username)}`);
