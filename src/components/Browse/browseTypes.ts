import { type UserDirectory } from '../../lib/users';

export type BrowseDirectory = UserDirectory & { locked?: boolean };

export type BrowseInfo = {
  directories: number;
  files: number;
  lockedDirectories: number;
  lockedFiles: number;
};

export type BrowseSession = {
  browseError: unknown;
  browseState: BrowseState;
  browseStatus: number;
  id: string;
  info: BrowseInfo;
  searchedAt: null | string;
  selectedDirectory: null | TreeNode;
  separator: string;
  tree: TreeNode[];
  username: string;
};

export type BrowseState = 'complete' | 'error' | 'idle' | 'pending';

export type TreeNode = BrowseDirectory & { children: TreeNode[] };

export const emptySession: Omit<BrowseSession, 'id'> = {
  browseError: undefined,
  browseState: 'idle',
  browseStatus: 0,
  info: { directories: 0, files: 0, lockedDirectories: 0, lockedFiles: 0 },
  searchedAt: null,
  selectedDirectory: null,
  separator: '\\',
  tree: [],
  username: '',
};
