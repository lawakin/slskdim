import { type ServerState } from '../types';
import api from './api';

export const getState = async (): Promise<ServerState> =>
  (await api.get<ServerState>('/server')).data;

export const connect = () => api.put('/server');

export const disconnect = ({
  message = 'client disconnected from web UI',
}: { message?: string } = {}) =>
  api.delete('/server', { data: JSON.stringify(message) });
