import { type ApplicationState, type VersionState } from '../types';
import api from './api';

export const getState = async (): Promise<ApplicationState> =>
  (await api.get<ApplicationState>('/application')).data;

export const restart = async () => api.put('/application');

export const shutdown = async () => api.delete('/application');

export const getVersion = async ({
  forceCheck = false,
}: { forceCheck?: boolean } = {}): Promise<VersionState> =>
  (
    await api.get<VersionState>(
      `/application/version/latest?forceCheck=${forceCheck}`,
    )
  ).data;
