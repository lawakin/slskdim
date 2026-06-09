import './Search.css';
import { createSearchHubConnection } from '../../lib/hubFactory';
import * as library from '../../lib/searches';
import ErrorSegment from '../Shared/ErrorSegment';
import LoaderSegment from '../Shared/LoaderSegment';
import PlaceholderSegment from '../Shared/PlaceholderSegment';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import SearchDetail from './Detail/SearchDetail';
import SearchList from './List/SearchList';
import { toErrorMessage } from '@/lib/utils';
import { type ServerState } from '@/types';
import { Loader2, Plus, Search as SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const Searches = ({ server }: { readonly server: ServerState }) => {
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState(undefined);
  const [searches, setSearches] = useState<Record<string, library.Search>>({});

  const [removing, setRemoving] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [creating, setCreating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { id: searchId } = useParams<{ id: string }>();
  const history = useHistory();
  const match = useRouteMatch();

  const onConnecting = () => {
    setConnecting(true);
  };

  const onConnected = () => {
    setConnecting(false);
    setError(undefined);
  };

  const onConnectionError = (connectionError: string | undefined) => {
    setConnecting(false);
    setError(connectionError);
  };

  const onUpdate = (
    update: React.SetStateAction<Record<string, library.Search>>,
  ) => {
    setSearches(update);
    onConnected();
  };

  useEffect(() => {
    onConnecting();

    const searchHub = createSearchHubConnection();

    searchHub.on('list', (searchesEvent) => {
      onUpdate(
        searchesEvent.reduce(
          (
            accumulator: Record<string, library.Search>,
            search: library.Search,
          ) => {
            accumulator[search.id] = search;
            return accumulator;
          },
          {} as Record<string, library.Search>,
        ),
      );
      onConnected();
    });

    searchHub.on('update', (search) => {
      onUpdate((old) => ({ ...old, [search.id]: search }));
    });

    searchHub.on('delete', (search) => {
      onUpdate((old) => {
        // eslint-disable-next-line @typescript-eslint/naming-convention, canonical/id-match, @typescript-eslint/no-unused-vars
        const { [search.id]: _removed, ...rest } = old;
        return rest;
      });
    });

    searchHub.on('create', (search) => {
      onUpdate((old) => ({ ...old, [search.id]: search }));
    });

    searchHub.onreconnecting((connectionError) =>
      onConnectionError(connectionError?.message ?? 'Disconnected'),
    );
    searchHub.onreconnected(() => onConnected());
    searchHub.onclose((connectionError) =>
      onConnectionError(connectionError?.message ?? 'Disconnected'),
    );

    const connect = async () => {
      try {
        onConnecting();
        await searchHub.start();
      } catch (connectionError) {
        toast.error(connectionError?.message ?? 'Failed to connect');
        onConnectionError(connectionError?.message ?? 'Failed to connect');
      }
    };

    connect();

    return () => {
      searchHub.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // create a new search, and optionally navigate to it to display the details
  // we do this if the user clicks the search icon, or repeats an existing search
  const create = async ({
    navigate = false,
    search,
  }: { navigate?: boolean; search?: string } = {}) => {
    const ref = inputRef.current;
    const searchText = search ?? ref?.value ?? '';
    const id = uuidv4();

    try {
      setCreating(true);
      await library.create({ id, searchText });

      try {
        if (ref) ref.value = '';
        ref?.focus();
      } catch {
        // we are probably repeating an existing search; the input isn't mounted.  no-op.
      }

      setCreating(false);

      if (navigate) {
        history.push(`${match.url.replace(`/${searchId}`, '')}/${id}`);
      }
    } catch (createError) {
      console.error(createError);
      toast.error(toErrorMessage(createError));
      setCreating(false);
    }
  };

  // delete a search
  const remove = async (search: library.Search) => {
    try {
      setRemoving(true);

      await library.remove({ id: search.id });
      setSearches((old) => {
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
        const { [search.id]: _, ...rest } = old;
        return rest;
      });

      setRemoving(false);
    } catch (error_) {
      console.error(error_);
      toast.error(toErrorMessage(error_));
      setRemoving(false);
    }
  };

  // stop an in-progress search
  const stop = async (search: library.Search) => {
    try {
      setStopping(true);
      await library.stop({ id: search.id });
      setStopping(false);
    } catch (stoppingError) {
      console.error(stoppingError);
      toast.error(toErrorMessage(stoppingError));
      setStopping(false);
    }
  };

  if (connecting) {
    return <LoaderSegment />;
  }

  if (error) {
    return <ErrorSegment caption={error?.message ?? error} />;
  }

  // if searchId is not null, there's an id in the route.
  // display the details for the search, if there is one
  if (searchId) {
    if (searches[searchId]) {
      return (
        <SearchDetail
          creating={creating}
          disabled={!server?.isConnected}
          onCreate={create}
          onRemove={remove}
          onStop={stop}
          removing={removing}
          search={searches[searchId]}
          stopping={stopping}
        />
      );
    }

    // if the searchId doesn't match a search we know about, chop
    // the id off of the url and force navigation back to the list
    history.replace(match.url.replace(`/${searchId}`, ''));
  }

  inputRef?.current?.focus();

  return (
    <>
      <div className="search-segment">
        <div className="search-segment-icon">
          <SearchIcon className="h-6 w-6" />
        </div>
        <div className="search-input flex gap-2">
          <Input
            className="flex-1"
            data-lpignore="true"
            disabled={creating || !server?.isConnected}
            onKeyUp={(event) => {
              if (event.key === 'Enter') void create();
            }}
            placeholder={
              server?.isConnected
                ? 'Search phrase'
                : 'Connect to server to perform a search'
            }
            ref={inputRef}
            type="search"
          />
          <Button
            disabled={creating || !server?.isConnected}
            onClick={() => create()}
            size="icon"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
          <Button
            disabled={creating || !server?.isConnected}
            onClick={() => create({ navigate: true })}
            size="icon"
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {Object.keys(searches).length === 0 ? (
        <PlaceholderSegment
          caption="No searches to display"
          icon="search"
        />
      ) : (
        <SearchList
          connecting={connecting}
          error={error}
          onRemove={remove}
          onStop={stop}
          searches={searches}
        />
      )}
    </>
  );
};

export default Searches;
