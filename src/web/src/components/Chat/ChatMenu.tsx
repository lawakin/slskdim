import './Chat.css';
import SendMessageModal from './SendMessageModal';
import { Circle } from 'lucide-react';

type ConversationSummary = {
  hasUnAcknowledgedMessages: boolean;
  unAcknowledgedMessageCount: number;
};

const ChatMenu = ({
  active,
  conversations,
  initiateConversation,
  onConversationChange,
}: {
  readonly active: string;
  readonly conversations: Record<string, ConversationSummary>;
  readonly initiateConversation: (
    username: string,
    message: string,
  ) => Promise<void>;
  readonly onConversationChange: (name: string) => void;
}) => {
  const isActive = (name: string) => active === name;

  return (
    <nav className="conversation-menu">
      {Object.keys(conversations).map((name) => (
        <button
          className={`menu-item ${isActive(name) ? 'menu-active' : ''}`}
          key={name}
          onClick={() => onConversationChange(name)}
          type="button"
        >
          <Circle className="h-2 w-2 text-green-500" />
          {name}
          {conversations[name].hasUnAcknowledgedMessages && (
            <span className="unread-badge">
              {conversations[name].unAcknowledgedMessageCount}
            </span>
          )}
        </button>
      ))}
      <div className="ml-auto">
        <SendMessageModal initiateConversation={initiateConversation} />
      </div>
    </nav>
  );
};

export default ChatMenu;
