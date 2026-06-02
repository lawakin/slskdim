import './Rooms.css';
import React, { useMemo } from 'react';
import { Flag, Icon, List, Popup } from 'semantic-ui-react';

const getDetails = (user) => {
  return user.countryCode ?? '?';
};

const RoomUserList = ({ users }) => {
  const getFlag = (user) => {
    if (!(user || {}).countryCode)
      return (
        <Icon
          className="unknown-user-flag"
          name="question"
        />
      );

    return <Flag name={user.countryCode.toLowerCase()} />;
  };

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
    <List>
      {sortedUsers.map((user) => (
        <List.Item
          className={user.self ? 'room-user-self' : ''}
          key={user.username}
        >
          <List.Content className={user.status === 'Online' ? '' : 'muted'}>
            <Popup
              content={getDetails(user)}
              trigger={getFlag(user)}
            />
            {user.username}
          </List.Content>
        </List.Item>
      ))}
    </List>
  );
};

export default RoomUserList;
