import './Rooms.css';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { type RoomUser } from './types';
import { useMemo } from 'react';
// import { Flag, Icon, List, Popup } from 'semantic-ui-react';

const getDetails = (user: RoomUser) => {
  return user.countryCode ?? '?';
};

const getFlag = (user: RoomUser) => {
  if (!(user || {}).countryCode)
    return (
      <div
        className="unknown-user-flag"
        // name="question"
      />
    );

  return <span className={`fi fi-${user.countryCode.toLowerCase()}`} />;
};

const RoomUserList = ({ users }: { readonly users: RoomUser[] }) => {
  const sortedUsers = useMemo(() => {
    const filtered = [...users]
      .sort((a, b) => a.username.localeCompare(b.username))
      .reduce(
        (accumulator, user) => {
          (user.status === 'Online'
            ? accumulator.online
            : accumulator.offline
          ).push(user);
          return accumulator;
        },
        { offline: [], online: [] },
      );

    return [...filtered.online, ...filtered.offline];
  }, [users]);

  return (
    <ul>
      {sortedUsers.map((user) => (
        <li
          className={user.self ? 'room-user-self' : ''}
          key={user.username}
        >
          <div className={user.status === 'Online' ? '' : 'muted'}>
            <Popover>
              <PopoverTrigger>{getFlag(user)}</PopoverTrigger>
              <PopoverContent>{getDetails(user)}</PopoverContent>
            </Popover>
            {user.username}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RoomUserList;
