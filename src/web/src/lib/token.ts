import { tokenKey, tokenPassthroughValue } from '../config';

export const getToken = (): string | null =>
  sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey);

export const setToken = (storage: Storage, token: string): void =>
  storage.setItem(tokenKey, token);

export const clearToken = (): void => {
  localStorage.removeItem(tokenKey);
  sessionStorage.removeItem(tokenKey);
};

export const isPassthroughEnabled = (): boolean =>
  getToken() === tokenPassthroughValue;
