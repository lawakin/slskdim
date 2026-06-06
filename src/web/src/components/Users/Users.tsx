import './Users.css';
import { activeUserInfoKey } from '../../config';
import * as users from '../../lib/users';
import PlaceholderSegment from '../Shared/PlaceholderSegment';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import User from './User';
import { Loader2, Search, UserIcon, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
// import { Icon, Input, Item, Loader, Segment } from 'semantic-ui-react';

const Users = () => {
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>();
  type UserData = {
    address: string;
    description: string;
    hasPicture: boolean;
    picture: string;
    port: number;
    presence: string;
    queueLength: number;
    uploadSlots: number;
    username: string;
  };
  const [user, setUser] = useState<UserData>();
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedUsername, setSelectedUsername] = useState(undefined);
  // eslint-disable-next-line react/hook-use-state
  const [{ error, fetching }, setStatus] = useState({
    error: undefined,
    fetching: false,
  });

  const setInputText = (text: string) => {
    if (inputRef.current) inputRef.current.value = text;
  };

  const setInputFocus = () => {
    inputRef.current.focus();
  };

  const clear = () => {
    localStorage.removeItem(activeUserInfoKey);
    setSelectedUsername(undefined);
    setUser(undefined);
    setInputText('');
    setInputFocus();
  };

  const keyUp = (event: KeyboardEvent) =>
    event.key === 'Escape' ? clear() : '';

  useLayoutEffect(() => {
    document.removeEventListener('keyup', keyUp, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.addEventListener('keyup', keyUp, false);

    const storedUsername =
      (location.state as { user?: string } | null)?.user ||
      localStorage.getItem(activeUserInfoKey);

    if (storedUsername) {
      setSelectedUsername(storedUsername);
      setInputText(storedUsername);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchUser = async () => {
      if (!selectedUsername) {
        return;
      }

      setStatus({ error: undefined, fetching: true });

      try {
        const [info, status, endpoint] = await Promise.all([
          users.getInfo({ username: selectedUsername }),
          users.getStatus({ username: selectedUsername }),
          users.getEndpoint({ username: selectedUsername }),
        ]);

        localStorage.setItem(activeUserInfoKey, selectedUsername);
        setUser({ ...info.data, ...status.data, ...endpoint.data });
        setStatus({ error: undefined, fetching: false });
      } catch (fetchError) {
        setStatus({ error: fetchError, fetching: false });
      }
    };

    fetchUser();
  }, [selectedUsername]);

  return (
    <div className="users-container">
      <div className="users-segment old-raised">
        <div className="users-segment-icon">
          <UserIcon />
        </div>
        <div className="relative">
          <Input
            className="pr-9"
            data-lpignore="true"
            disabled={Boolean(user) || fetching}
            onChange={(event) => setUsernameInput(event.target.value)}
            onKeyUp={(event) =>
              event.key === 'Enter' ? setSelectedUsername(usernameInput) : ''
            }
            placeholder="Username"
            ref={inputRef}
            type="search"
          />
          {!fetching &&
            (user == null ? (
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setSelectedUsername(usernameInput)}
              >
                <Search className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500"
                onClick={clear}
              >
                <X className="h-4 w-4" />
              </Button>
            ))}
        </div>
      </div>
      {fetching ? (
        <Loader2
          // active
          className="search-loader"
          // inline="centered"
          // size="big"
        />
      ) : (
        <div>
          {error ? (
            <span>Failed to retrieve information for {selectedUsername}</span>
          ) : user == null ? (
            <PlaceholderSegment
              caption="No user info to display"
              icon="users"
              size={undefined}
            />
          ) : (
            <div
              className="users-user"
              // raised
            >
              <div>
                <User {...user} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;
