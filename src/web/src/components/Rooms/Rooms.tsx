import { activeRoomKey } from '../../config';
import * as rooms from '../../lib/rooms';
import PlaceholderSegment from '../Shared/PlaceholderSegment';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import RoomMenu from './RoomMenu';
import RoomUserList from './RoomUserList';
import { type RoomMessage, type RoomUser } from './types';
import { Circle, Loader2, Send, X } from 'lucide-react';
import React, { memo, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'numeric',
  }).format(date);
};

const RoomMessageHistory = memo(
  ({
    messages,
    onHandleContextMenu,
  }: {
    readonly messages: RoomMessage[];
    readonly onHandleContextMenu: (
      event: React.MouseEvent,
      message: RoomMessage,
    ) => void;
  }) => (
    <>
      {messages.map((message) => (
        <div
          key={`${message.timestamp}+${message.message}`}
          onContextMenu={(clickEvent) =>
            onHandleContextMenu(clickEvent, message)
          }
        >
          <div
            className={`room-message ${message.self ? 'room-message-self' : ''}`}
          >
            <span className="room-message-time">
              {formatTimestamp(message.timestamp)}
            </span>
            <span className="room-message-name">{message.username}: </span>
            <span className="room-message-message">{message.message}</span>
          </div>
        </div>
      ))}
      <div id="room-history-scroll-anchor" />
    </>
  ),
);

RoomMessageHistory.displayName = 'RoomMessageHistory';

const Rooms = () => {
  const history = useHistory();

  const [active, setActive] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    message: RoomMessage | null;
    open: boolean;
    x: number;
    y: number;
  }>({ message: null, open: false, x: 0, y: 0 });
  const [joined, setJoined] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState<{
    messages: RoomMessage[];
    users: RoomUser[];
  }>({ messages: [], users: [] });

  // keeps interval callbacks from going stale
  const activeRef = useRef('');
  activeRef.current = active;

  const listRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLInputElement>(null);

  const fetchActiveRoom = async () => {
    const currentActive = activeRef.current;
    if (currentActive.length === 0) return;
    const messages = await rooms.getMessages({ roomName: currentActive });
    const users = await rooms.getUsers({ roomName: currentActive });
    setRoom({ messages, users });
  };

  const fetchJoinedRooms = async () => {
    const joinedRooms = await rooms.getJoined();
    setJoined(joinedRooms);
    return joinedRooms;
  };

  const selectRoom = async (roomName: string) => {
    setActive(roomName);
    setLoading(true);
    setMessage((previous) => (activeRef.current === roomName ? previous : ''));
    setRoom({ messages: [], users: [] });

    sessionStorage.setItem(activeRoomKey, roomName);

    if (roomName.length > 0) {
      const messages = await rooms.getMessages({ roomName });
      const users = await rooms.getUsers({ roomName });
      setRoom({ messages, users });
    }

    setLoading(false);

    try {
      listRef.current?.lastElementChild?.scrollIntoView();
    } catch {
      /* no-op */
    }

    try {
      messageRef.current?.focus();
    } catch {
      /* no-op */
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu((previous) => ({ ...previous, open: false }));
  };

  const handleContextMenu = (
    clickEvent: React.MouseEvent,
    message_: RoomMessage,
  ) => {
    clickEvent.preventDefault();
    setContextMenu({
      message: message_,
      open: true,
      x: clickEvent.pageX,
      y: clickEvent.pageY,
    });
  };

  const handleReply = () => {
    setMessage(
      `[${contextMenu.message.username}] ${contextMenu.message.message} --> `,
    );
    messageRef.current?.focus();
  };

  const joinRoom = async (roomName: string) => {
    await rooms.join({ roomName });
    await fetchJoinedRooms();
    await selectRoom(roomName);
  };

  const leaveRoom = async (roomName: string) => {
    await rooms.leave({ roomName });
    const joinedRooms = await fetchJoinedRooms();
    await selectRoom(joinedRooms[0] || '');
  };

  const validInput = () => activeRef.current.length > 0 && message.length > 0;

  const sendMessage = async () => {
    if (!validInput()) return;
    await rooms.sendMessage({ message, roomName: activeRef.current });
    setMessage('');
  };

  useEffect(() => {
    const savedActive = sessionStorage.getItem(activeRoomKey) || '';
    activeRef.current = savedActive;
    setActive(savedActive);

    const init = async () => {
      const joinedRooms = await fetchJoinedRooms();
      const roomToSelect = joinedRooms.includes(savedActive)
        ? savedActive
        : joinedRooms[0] || '';
      await selectRoom(roomToSelect);
    };

    void init();

    const messagesInterval = window.setInterval(() => fetchActiveRoom(), 1_000);
    const roomsInterval = window.setInterval(() => fetchJoinedRooms(), 500);

    document.addEventListener('click', handleCloseContextMenu);

    return () => {
      clearInterval(messagesInterval);
      clearInterval(roomsInterval);
      document.removeEventListener('click', handleCloseContextMenu);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rooms">
      <div className="rooms-segment">
        <div className="rooms-segment-icon" />
        <RoomMenu
          active={active}
          joinRoom={joinRoom}
          joined={joined}
          onRoomChange={(name: string) => selectRoom(name)}
        />
      </div>
      {active?.length === 0 ? (
        <PlaceholderSegment
          caption="No rooms to display"
          icon="comments"
        />
      ) : (
        <Card className="room-active-card">
          <CardContent onClick={() => messageRef.current?.focus()}>
            <CardHeader>
              <Circle className="h-3 w-3 text-green-500" />
              {active}
              <button
                className="close-button ml-auto"
                onClick={() => leaveRoom(active)}
                type="button"
              >
                <X className="h-4 w-4 text-red-500" />
              </button>
            </CardHeader>
            <div className="room relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div>
                    <div
                      className="room-history"
                      ref={listRef}
                    >
                      <RoomMessageHistory
                        messages={room.messages}
                        onHandleContextMenu={handleContextMenu}
                      />
                    </div>
                    <div className="room-input flex gap-2">
                      <Input
                        autoComplete="off"
                        data-lpignore="true"
                        id="room-message-input"
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyUp={(event: React.KeyboardEvent) => {
                          if (event.key === 'Enter') void sendMessage();
                        }}
                        ref={messageRef}
                        type="text"
                        value={message}
                      />
                      <Button
                        className="room-message-button"
                        disabled={!validInput()}
                        onClick={sendMessage}
                        type="button"
                        variant="ghost"
                      >
                        <Send className="h-4 w-4 text-green-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="room-users">
                    <RoomUserList users={room.users} />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {contextMenu.open && (
        <div
          className="popup-menu"
          style={{
            left: contextMenu.x,
            maxHeight: `calc(100vh - ${contextMenu.y}px)`,
            position: 'fixed',
            top: contextMenu.y,
            zIndex: 1_000,
          }}
        >
          <button
            className="popup-option"
            onClick={handleReply}
            type="button"
          >
            Reply
          </button>
          <button
            className="popup-option"
            onClick={() =>
              history.push('/users', { user: contextMenu.message?.username })
            }
            type="button"
          >
            User Profile
          </button>
          <button
            className="popup-option"
            onClick={() =>
              history.push('/browse', { user: contextMenu.message?.username })
            }
            type="button"
          >
            Browse Shares
          </button>
        </div>
      )}
    </div>
  );
};

export default Rooms;
