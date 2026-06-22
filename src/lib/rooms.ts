import api from './api';

export type AvailableRoom = {
  isModerated: boolean;
  isOwned: boolean;
  isPrivate: boolean;
  name: string;
  userCount: number;
};

export type RoomMessage = {
  message: string;
  self: boolean;
  timestamp: string;
  username: string;
};

export type RoomUser = {
  countryCode: string | null;
  self: boolean;
  status: string;
  username: string;
};

export const getAvailable = async (): Promise<AvailableRoom[] | undefined> => {
  const response = (await api.get<AvailableRoom[]>('/rooms/available')).data;

  if (!Array.isArray(response)) {
    console.warn('got non-array response from rooms API', response);
    return undefined;
  }

  return response;
};

export const getJoined = async (): Promise<string[] | undefined> => {
  const response = (await api.get<string[]>('/rooms/joined')).data;

  if (!Array.isArray(response)) {
    console.warn('got non-array response from rooms API', response);
    return undefined;
  }

  return response;
};

export const getMessages = async ({
  roomName,
}: {
  roomName: string;
}): Promise<RoomMessage[] | undefined> => {
  const response = (
    await api.get<RoomMessage[]>(
      `/rooms/joined/${encodeURIComponent(roomName)}/messages`,
    )
  ).data;

  if (!Array.isArray(response)) {
    console.warn('got non-array response from rooms API', response);
    return undefined;
  }

  return response;
};

export const getUsers = async ({
  roomName,
}: {
  roomName: string;
}): Promise<RoomUser[] | undefined> => {
  const response = (
    await api.get<RoomUser[]>(
      `/rooms/joined/${encodeURIComponent(roomName)}/users`,
    )
  ).data;

  if (!Array.isArray(response)) {
    console.warn('got non-array response from rooms API', response);
    return undefined;
  }

  return response;
};

export const join = async ({ roomName }: { roomName: string }) =>
  api.post('/rooms/joined', roomName);

export const leave = async ({ roomName }: { roomName: string }) =>
  api.delete(`/rooms/joined/${encodeURIComponent(roomName)}`);

export const sendMessage = async ({
  roomName,
  message,
}: {
  message: string;
  roomName: string;
}) =>
  api.post(
    `/rooms/joined/${encodeURIComponent(roomName)}/messages`,
    JSON.stringify(message),
  );
