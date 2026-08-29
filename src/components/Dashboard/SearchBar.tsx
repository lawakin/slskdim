import '../Search/Search.css';
import { urlBase } from '../../config';
import * as library from '../../lib/searches';
import { toErrorMessage } from '@/lib/utils';
import { type ServerState } from '@/types';
import { Loader2, Plus, Search as SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const SearchBar = ({ server }: { readonly server?: ServerState }) => {
  const [creating, setCreating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  const create = async ({ navigate = false }: { navigate?: boolean } = {}) => {
    const ref = inputRef.current;
    const searchText = ref?.value ?? '';
    const id = uuidv4();

    try {
      setCreating(true);
      await library.create({ id, searchText });

      if (ref) ref.value = '';
      ref?.focus();

      setCreating(false);

      if (navigate) {
        history.push(`${urlBase}/searches/${id}`);
      } else {
        const label =
          searchText.length > 30 ? `${searchText.slice(0, 15)}...` : searchText;
        toast.info(
          <span>
            Search for &lsquo;{label}&rsquo; started.{' '}
            <Link to={`${urlBase}/searches/${id}`}>View results</Link>
          </span>,
        );
      }
    } catch (createError) {
      console.error(createError);
      toast.error(toErrorMessage(createError));
      setCreating(false);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
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
  );
};

export default SearchBar;
