/* eslint-disable promise/prefer-await-to-then */
import './Browse.css';
import * as users from '../../lib/users';
import PlaceholderSegment from '../Shared/PlaceholderSegment';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import BrowsePane from './BrowsePane';
import {
  type BrowseDirectory,
  type BrowseInfo,
  type BrowseSession,
  type BrowseState,
  type TreeNode,
  emptySession,
} from './browseTypes';
import { Loader2, RefreshCw, Search, X } from 'lucide-react';
import * as lzString from 'lz-string';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'soulseek-example-browse-state';

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

  const dirSet = new Set(directories.map((d) => d.name));
  const childrenMap = new Map<string, BrowseDirectory[]>();

  for (const d of directories) {
    const lastSep = d.name.lastIndexOf(separator);
    const parentPath = lastSep === -1 ? '' : d.name.slice(0, lastSep);
    if (!childrenMap.has(parentPath)) {
      childrenMap.set(parentPath, []);
    }
    childrenMap.get(parentPath)!.push(d);
  }

  const buildNode = (d: BrowseDirectory): TreeNode => ({
    ...d,
    children: (childrenMap.get(d.name) ?? []).map(buildNode),
  });

  return directories
    .filter((d) => {
      const lastSep = d.name.lastIndexOf(separator);
      const parentPath = lastSep === -1 ? '' : d.name.slice(0, lastSep);
      return !dirSet.has(parentPath);
    })
    .map(buildNode);
};

const Browse = () => {
  const location = useLocation<{ user?: string }>();

  const [sessions, setSessions] = useState<BrowseSession[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState('');
  const sessionsRef = useRef<BrowseSession[]>([]);
  sessionsRef.current = sessions;
  const activeIdRef = useRef('');
  activeIdRef.current = activeId;

  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const saveToStorage = (state: object) => {
    workerRef.current?.postMessage(JSON.stringify(state));
  };

  const fetchStatus = () => {
    for (const s of sessionsRef.current) {
      if (s.browseState !== 'pending') continue;
      void users
        .getBrowseStatus({ username: s.username })
        .then((response) => {
          setSessions((prev) =>
            prev.map((p) =>
              p.id === s.id ? { ...p, browseStatus: response.data } : p,
            ),
          );
        });
    }
  };

  const doBrowse = async (id: string, targetUsername: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, browseError: undefined, browseState: 'pending' }
          : s,
      ),
    );

    try {
      const response = await users.browse({ username: targetUsername });
      let { directories } = response;
      const { lockedDirectories } = response;

      let separator = '\\';
      const directoryCount = directories.length;
      const fileCount = directories.reduce((accumulator, directory) => {
        if (directory.name.includes('/')) separator = '/';
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
      const newTree = getDirectoryTree({ directories, separator });

      const newSessions = sessionsRef.current.map((s) =>
        s.id === id
          ? {
              ...s,
              browseError: undefined,
              browseState: 'complete' as BrowseState,
              info: newInfo,
              searchedAt: new Date().toISOString(),
              separator,
              tree: newTree,
            }
          : s,
      );
      setSessions(newSessions);
      saveToStorage({ activeId: activeIdRef.current, sessions: newSessions });
    } catch (error) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, browseError: error, browseState: 'error' } : s,
        ),
      );
    }
  };

  const search = () => {
    const target = usernameInput.trim();
    if (!target) return;
    setUsernameInput('');

    const existing = sessionsRef.current.find((s) => s.username === target);
    if (existing) {
      setActiveId(existing.id);
      void doBrowse(existing.id, target);
      return;
    }

    const id = uuidv4();
    setSessions((prev) => [...prev, { ...emptySession, id, username: target }]);
    setActiveId(id);
    void doBrowse(id, target);
  };

  const closeTab = (id: string) => {
    setSessions((prev) => {
      const newSessions = prev.filter((s) => s.id !== id);
      if (activeIdRef.current === id && newSessions.length > 0) {
        const closedIndex = prev.findIndex((s) => s.id === id);
        setActiveId(newSessions[Math.max(0, closedIndex - 1)].id);
      } else if (newSessions.length === 0) {
        setActiveId('');
      }
      saveToStorage({ activeId: activeIdRef.current, sessions: newSessions });
      return newSessions;
    });
  };

  useEffect(() => {
    if (location.state?.user) {
      const targetUser = location.state.user;
      const id = uuidv4();
      setSessions([{ ...emptySession, id, username: targetUser }]);
      setActiveId(id);
      void doBrowse(id, targetUser);
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(lzString.decompress(raw)) as {
            activeId?: string;
            sessions?: Partial<BrowseSession>[];
          };
          if (parsed?.sessions?.length) {
            const restored = parsed.sessions.map(
              (s): BrowseSession => ({
                ...emptySession,
                ...s,
                id: s.id ?? uuidv4(),
                browseError: undefined,
                browseStatus: 0,
                browseState:
                  s.browseState === 'pending'
                    ? 'idle'
                    : (s.browseState ?? 'idle'),
              }),
            );
            setSessions(restored);
            setActiveId(parsed.activeId ?? restored[0]?.id ?? '');
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    const worker = new Worker(
      new URL('./browse.worker.ts', import.meta.url),
      { type: 'module' },
    );
    worker.onmessage = (e: MessageEvent<string>) => {
      try {
        localStorage.setItem(STORAGE_KEY, e.data);
      } catch (err) {
        console.error(err);
      }
    };
    workerRef.current = worker;

    const intervalId = window.setInterval(fetchStatus, 500);
    return () => {
      clearInterval(intervalId);
      worker.terminate();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="px-[var(--content-padding-h)] max-w-[var(--content-max-width)] mx-auto last:mb-[var(--card-bottom-margin)]">
      <div className="mt-[15px] h-[var(--segment-header-height)] flex gap-2">
        <Input
          className="search-input"
          data-lpignore="true"
          onChange={(event) => setUsernameInput(event.target.value)}
          onKeyUp={(event) => {
            if (event.key === 'Enter') search();
          }}
          placeholder="Username"
          ref={inputRef}
          type="search"
          value={usernameInput}
        />
        <Button
          onClick={search}
          size="icon"
          variant="ghost"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {sessions.length === 0 ? (
        <PlaceholderSegment
          caption="Search for a user to browse their files"
          icon="folder open"
        />
      ) : (
        <Tabs
          className="mt-3"
          onValueChange={setActiveId}
          value={activeId}
        >
          <TabsList variant="line">
            {sessions.map((s) => (
              <TabsTrigger
                key={s.id}
                value={s.id}
              >
                {s.username}
                {s.browseState === 'pending' && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                <span
                  className="opacity-50 hover:opacity-100 ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(s.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {sessions.map((s) => (
            <TabsContent
              key={s.id}
              value={s.id}
            >
              <div className="flex items-center gap-2 mt-2 mb-1 text-sm text-muted-foreground">
                {s.searchedAt ? (
                  <span>
                    Browsed {new Date(s.searchedAt).toLocaleString()}
                  </span>
                ) : s.browseState === 'pending' ? (
                  <span>Browsing...</span>
                ) : null}
                <Button
                  disabled={s.browseState === 'pending'}
                  onClick={() => doBrowse(s.id, s.username)}
                  size="sm"
                  variant="ghost"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </Button>
                <Button
                  className="text-red-500"
                  onClick={() => closeTab(s.id)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-3 w-3" />
                  Close
                </Button>
              </div>
              <BrowsePane
                browseError={s.browseError}
                browseStatus={s.browseStatus}
                info={s.info}
                onSelectDirectory={(dir) =>
                  setSessions((prev) =>
                    prev.map((p) =>
                      p.id === s.id ? { ...p, selectedDirectory: dir } : p,
                    ),
                  )
                }
                pending={s.browseState === 'pending'}
                selectedDirectory={s.selectedDirectory}
                separator={s.separator}
                tree={s.tree}
                username={s.username}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default Browse;
