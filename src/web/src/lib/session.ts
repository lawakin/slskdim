import { tokenPassthroughValue } from '../config';
import api from './api';
import { clearToken, getToken, setToken } from './token';
import { AxiosError } from 'axios';

export const getSecurityEnabled = async () => {
  return (await api.get('/session/enabled')).data;
};

export const enablePassthrough = () => {
  console.debug(
    'enabling token passthrough.  api calls will not be authenticated',
  );
  setToken(sessionStorage, tokenPassthroughValue);
};

export const isLoggedIn = () => {
  const token = getToken();
  return (
    token !== undefined && token !== null && token !== tokenPassthroughValue
  );
};

export const login = async ({
  username,
  password,
  rememberMe = false,
}: {
  password: string;
  rememberMe: boolean;
  username: string;
}) => {
  const { token } = (await api.post('/session', { password, username })).data;
  setToken(rememberMe ? localStorage : sessionStorage, token);
  return token;
};

export const logout = () => {
  console.debug('removing token from local and session storage');
  clearToken();
};

export const check = async () => {
  try {
    await api.get('/session');
    return true;
  } catch (error: unknown) {
    if (!(error instanceof AxiosError)) {
      throw error;
    }

    if (error.response?.status === 401) {
      console.error('session error; not logged in or session has expired');
      logout();
      return false;
    } else {
      throw error;
    }
  }
};
