export type ConnectionWatchdogState = {
  isAttemptingConnection?: boolean;
  isAwaitingVpn?: boolean;
  isEnabled?: boolean;
  nextAttemptAt?: string | null;
};

export type DistributedNetworkState = {
  branchLevel?: number;
  branchRoot?: string | null;
  canAcceptChildren?: boolean;
  childLimit?: number;
  children?: string[];
  hasBranchRoot?: boolean;
  hasParent?: boolean;
  isBranchRoot?: boolean;
  parent?: string | null;
};

export type HealthState = {
  search?: {
    incoming?: {
      dropRate?: number;
      latency?: number;
      queueDepth?: number;
    };
  };
};

export type RelayControllerState = {
  address?: string | null;
  state?: 'Connected' | 'Connecting' | 'Reconnecting' | 'Disconnected';
};

export type RelayState = {
  agents?: unknown[];
  controller?: RelayControllerState;
  mode?: 'Controller' | 'Agent';
};

export type ServerState = {
  address?: string | null;
  isConnected?: boolean;
  isConnecting?: boolean;
  isLoggedIn?: boolean;
  isLoggingIn?: boolean;
  isTransitioning?: boolean;
};

export type ShareState = {
  cancelled?: boolean;
  directories?: number;
  faulted?: boolean;
  files?: number;
  hosts?: string[];
  ready?: boolean;
  scanPending?: boolean;
  scanProgress?: number;
  scanning?: boolean;
};

export type UserState = {
  privileges?: {
    isPrivileged?: boolean;
    privilegesRemaining?: number;
  };
  statistics?: {
    averageSpeed?: number;
    directoryCount?: number;
    fileCount?: number;
    uploadCount?: number;
  };
  username?: string | null;
};

export type VersionState = {
  current?: string;
  full?: string;
  isCanary?: boolean;
  isDevelopment?: boolean;
  isUpdateAvailable?: boolean | null;
  latest?: string | null;
};

export type VpnState = {
  forwardedPort?: number | null;
  isConnected?: boolean;
  isReady?: boolean;
  location?: string | null;
  publicIPAddress?: string | null;
};

export type ApplicationState = {
  connectionWatchdog?: ConnectionWatchdogState;
  distributedNetwork?: DistributedNetworkState;
  health?: HealthState;
  pendingReconnect?: boolean;
  pendingRestart?: boolean;
  relay?: RelayState;
  rooms?: string[];
  server?: ServerState;
  shares?: ShareState;
  user?: UserState;
  users?: unknown[];
  version?: VersionState;
  vpn?: VpnState;
};

export type AppContextValue = {
  options: Record<string, unknown>;
  state: ApplicationState;
};
