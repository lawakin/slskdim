/* eslint-disable promise/prefer-await-to-then */
import './Browse.css';
import { type UserDirectory } from '../../lib/users';
import * as users from '../../lib/users';
import PlaceholderSegment from '../Shared/PlaceholderSegment';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import Directory from './Directory';
import DirectoryTree from './DirectoryTree';
import { Circle, Loader2, Search, X } from 'lucide-react';
import * as lzString from 'lz-string';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

type BrowseState = 'idle' | 'pending' | 'complete' | 'error';

type BrowseInfo = {
  directories: number;
  files: number;
  lockedDirectories: number;
  lockedFiles: number;
};

type BrowseDirectory = UserDirectory & { locked?: boolean };

type TreeNode = BrowseDirectory & { children: TreeNode[] };

const STORAGE_KEY = 'soulseek-example-browse-state';

const saveToStorage = (state: object) => {
  const store = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        lzString.compress(JSON.stringify(state)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (window.requestIdleCallback) {
    window.requestIdleCallback(store);
  } else {
    void Promise.resolve().then(store);
  }
};

const getChildDirectories = (
  depthMap: Map<number, BrowseDirectory[]>,
  root: BrowseDirectory,
  separator: string,
  depth: number,
): TreeNode => {
  if (!depthMap.has(depth)) {
    return { ...root, children: [] };
  }

  const children = depthMap
    .get(depth)
    .filter((d) => d.name.startsWith(root.name));
  return {
    ...root,
    children: children.map((c) =>
      getChildDirectories(depthMap, c, separator, depth + 1),
    ),
  };
};

const getDirectoryTree = ({
  directories,
  separator,
}: {
  directories: BrowseDirectory[];
  separator: string;
}): TreeNode[] => {
  if (directories.length === 0 || directories[0].name === undefined) {
    return [];
  }

  const depthMap = new Map<number, BrowseDirectory[]>();
  for (const d of directories) {
    const directoryDepth = d.name.split(separator).length;
    if (!depthMap.has(directoryDepth)) {
      depthMap.set(directoryDepth, []);
    }

    depthMap.get(directoryDepth).push(d);
  }

  const depth = Math.min(...Array.from(depthMap.keys()));
  return depthMap
    .get(depth)
    .map((directory) =>
      getChildDirectories(depthMap, directory, separator, depth + 1),
    );
};

const emptyInfo: BrowseInfo = {
  directories: 0,
  files: 0,
  lockedDirectories: 0,
  lockedFiles: 0,
};

const Browse = () => {
  const location = useLocation<{ user?: string }>();

  const [browseError, setBrowseError] = useState<unknown>(undefined);
  const [browseState, setBrowseState] = useState<BrowseState>('idle');
  const [browseStatus, setBrowseStatus] = useState(0);
  const [info, setInfo] = useState<BrowseInfo>(emptyInfo);
  const [selectedDirectory, setSelectedDirectory] = useState<TreeNode | null>(
    null,
  );
  const [separator, setSeparator] = useState('\\');
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [username, setUsername] = useState('');

  const browseStateRef = useRef<BrowseState>('idle');
  browseStateRef.current = browseState;

  const usernameRef = useRef('');
  usernameRef.current = username;

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = () => {
    if (browseStateRef.current !== 'pending') return;
    void users
      .getBrowseStatus({ username: usernameRef.current })
      .then((response) => {
        setBrowseStatus(response.data);
      });
  };

  const doBrowse = async (targetUsername: string) => {
    setBrowseError(undefined);
    setBrowseState('pending');

    try {
      const response = await users.browse({ username: targetUsername });
      let { directories } = response;
      const { lockedDirectories } = response;

      let separator2 = '\\';
      const directoryCount = directories.length;
      const fileCount = directories.reduce((accumulator, directory) => {
        if (directory.name.includes('/')) separator2 = '/';
        return accumulator + directory.fileCount;
      }, 0);

      const lockedDirectoryCount = lockedDirectories.length;
      const lockedFileCount = lockedDirectories.reduce(
        (accumulator, directory) => accumulator + directory.fileCount,
        0,
      );

      directories = [
        ...directories,
        ...lockedDirectories.map((d) => ({ ...d, locked: true })),
      ];

      const newInfo: BrowseInfo = {
        directories: directoryCount,
        files: fileCount,
        lockedDirectories: lockedDirectoryCount,
        lockedFiles: lockedFileCount,
      };
      const newTree = getDirectoryTree({ directories, separator: separator2 });

      setSeparator(separator2);
      setInfo(newInfo);
      setTree(newTree);
      setBrowseState('complete');

      saveToStorage({
        info: newInfo,
        separator: separator2,
        tree: newTree,
        username: targetUsername,
      });
    } catch (error) {
      setBrowseError(error);
      setBrowseState('error');
    }
  };

  const clear = () => {
    setBrowseError(undefined);
    setBrowseState('idle');
    setBrowseStatus(0);
    setInfo(emptyInfo);
    setSelectedDirectory(null);
    setSeparator('\\');
    setTree([]);
    setUsername('');
    saveToStorage({});
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (location.state?.user) {
      setUsername(location.state.user);
      void doBrowse(location.state.user);
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(lzString.decompress(raw));
          if (parsed) {
            setBrowseState(parsed.browseState ?? 'idle');
            setInfo(parsed.info ?? emptyInfo);
            setSelectedDirectory(parsed.selectedDirectory ?? null);
            setSeparator(parsed.separator ?? '\\');
            setTree(parsed.tree ?? []);
            setUsername(parsed.username ?? '');
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    const intervalId = window.setInterval(fetchStatus, 500);
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clear();
    };

    document.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pending = browseState === 'pending';
  const emptyTree = tree.length === 0;
  const files = (selectedDirectory?.files ?? []).map((f) => ({
    ...f,
    filename: `${selectedDirectory?.name}${separator}${f.filename}`,
  }));

  return (
    <div className="search-container">
      <div className="browse-segment">
        <div className="browse-segment-icon" />
        <div className="flex gap-2">
          <Input
            className="search-input"
            data-lpignore="true"
            disabled={pending}
            onChange={(event) => setUsername(event.target.value)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') void doBrowse(username);
            }}
            placeholder="Username"
            ref={inputRef}
            type="search"
            value={username}
          />
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin self-center" />
          ) : browseState === 'idle' || browseState === 'error' ? (
            <Button
              onClick={() => doBrowse(username)}
              size="icon"
              variant="ghost"
            >
              <Search className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={clear}
              size="icon"
              variant="ghost"
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>
      {pending ? (
        <div className="search-loader flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Downloaded {Math.round(browseStatus ?? 0)}% of Response</span>
        </div>
      ) : (
        <div>
          {browseError ? (
            <span className="browse-error">Failed to browse {username}</span>
          ) : (
            <div className="browse-container">
              {emptyTree ? (
                <PlaceholderSegment
                  caption="User is not sharing any files"
                  icon="folder open"
                />
              ) : (
                <Card className="browse-tree-card">
                  <CardContent>
                    <CardHeader>
                      <Circle className="h-3 w-3 text-green-500" />
                      {username}
                    </CardHeader>
                    <p className="browse-meta">
                      {`${info.files + info.lockedFiles} files in ${info.directories + info.lockedDirectories} directories (including ${info.lockedFiles} files in ${info.lockedDirectories} locked directories)`}
                    </p>
                    <div className="browse-folderlist">
                      <DirectoryTree
                        onSelect={(_, value) =>
                          setSelectedDirectory({ ...value, children: [] })
                        }
                        selectedDirectoryName={selectedDirectory?.name}
                        tree={tree}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              {selectedDirectory?.name && (
                <Directory
                  files={files}
                  locked={selectedDirectory.locked}
                  marginTop={-20}
                  name={selectedDirectory.name}
                  onClose={() => setSelectedDirectory(null)}
                  username={username}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Browse;
