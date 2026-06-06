import { hubBaseUrl } from '../config';
import { getToken, isPassthroughEnabled } from './token';
import {
  type HubConnection,
  HubConnectionBuilder,
  JsonHubProtocol,
  LogLevel,
} from '@microsoft/signalr';

export const createHubConnection = ({ url }: { url: string }): HubConnection =>
  new HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: isPassthroughEnabled() ? undefined : getToken,
      withCredentials: true,
    })
    .withAutomaticReconnect([
      0, 100, 250, 500, 1_000, 2_000, 3_000, 5_000, 5_000, 5_000, 5_000, 5_000,
    ])
    .withHubProtocol(new JsonHubProtocol())
    .configureLogging(LogLevel.Warning)
    .build();

export const createApplicationHubConnection = (): HubConnection =>
  createHubConnection({ url: `${hubBaseUrl}/application` });

export const createLogsHubConnection = (): HubConnection =>
  createHubConnection({ url: `${hubBaseUrl}/logs` });

export const createSearchHubConnection = (): HubConnection =>
  createHubConnection({ url: `${hubBaseUrl}/search` });
