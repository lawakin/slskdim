import './Rooms.css';
import RoomJoinModal from './RoomJoinModal';
import { Circle } from 'lucide-react';

const RoomMenu = ({
  active,
  joinRoom,
  joined,
  onRoomChange,
}: {
  readonly active: string;
  readonly joinRoom: (roomName: string) => Promise<void>;
  readonly joined: string[];
  readonly onRoomChange: (name: string) => Promise<void>;
}) => {
  const isActive = (name: string) => active === name;

  return (
    <nav className="room-menu">
      {joined.map((name) => (
        <button
          className={`room-menu-item ${isActive(name) ? 'menu-active' : ''}`}
          key={name}
          onClick={() => onRoomChange(name)}
          type="button"
        >
          <Circle className="h-2 w-2 text-green-500" />
          {name}
        </button>
      ))}
      <div className="ml-auto">
        <RoomJoinModal joinRoom={joinRoom} />
      </div>
    </nav>
  );
};

export default RoomMenu;
