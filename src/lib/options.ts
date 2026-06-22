import { type ApplicationOptions } from '../types';
import api from './api';

export const getCurrent = async (): Promise<ApplicationOptions> =>
  (await api.get<ApplicationOptions>('/options')).data;

export const getCurrentDebugView = async (): Promise<string> =>
  (await api.get<string>('/options/debug')).data;

export const getYaml = async (): Promise<string> =>
  (await api.get<string>('/options/yaml')).data;

export const getYamlLocation = async (): Promise<string> =>
  (await api.get<string>('/options/yaml/location')).data;

export const validateYaml = async ({
  yaml,
}: {
  yaml: string;
}): Promise<string | undefined> =>
  (await api.post<string | undefined>('/options/yaml/validate', yaml)).data;

export const updateYaml = async ({
  yaml,
}: {
  yaml: string;
}): Promise<unknown> => (await api.put('/options/yaml', yaml)).data;
