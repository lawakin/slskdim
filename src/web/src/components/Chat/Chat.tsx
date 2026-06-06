import './Chat.css';
import { activeChatKey } from '../../config';
import * as chat from '../../lib/chat';
import PlaceholderSegment from '../Shared/PlaceholderSegment';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import ChatMenu from './ChatMenu';
import { type ApplicationState } from '@/types';
import { Circle, Loader2, Send, X } from 'lucide-react';
import React, { memo, useEffect, useRef, useState } from 'react';

type ChatMessage = {
  direction: 'In' | 'Out';
  message: string;
  timestamp: string;
  username: string;
};

type Conversation = {
  hasUnAcknowledgedMessages: boolean;
  messages: ChatMessage[];
  unAcknowledgedMessageCount: number;
  username: string;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'numeric',
  }).format(date);
};

const ChatMessageHistory = memo(
  ({
    messages,
    selfUsername,
  }: {
    readonly messages: ChatMessage[];
    readonly selfUsername: string;
  }) => (
    <>
      {messages.map((message) => (
        <div
          className={`chat-message ${message.direction === 'Out' ? 'chat-message-self' : ''}`}
          key={`${message.timestamp}+${message.message}`}
        >
          <span className="chat-message-time">
            {formatTimestamp(message.timestamp)}
          </span>
          <span className="chat-message-name">
            {message.direction === 'Out' ? selfUsername : message.username}:
          </span>
          <span className="chat-message-message">{message.message}</span>
        </div>
      ))}
      <div id="chat-history-scroll-anchor" />
    </>
  ),
);

const acknowledgeMessages = async (username: string) => {
  if (!username) return;
  await chat.acknowledge({ username });
};

ChatMessageHistory.displayName = 'ChatMessageHistory';

const Chat = ({ state: appState }: { readonly state: ApplicationState }) => {
  const [active, setActive] = useState('');
  const [conversations, setConversations] = useState<
    Record<string, Conversation>
  >({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const activeRef = useRef('');
  activeRef.current = active;

  const listRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLInputElement>(null);

  const selectConversation = async (username: string) => {
    const previousActive = activeRef.current;
    setActive(username);
    activeRef.current = username;
    setLoading(true);
    setMessage((previous) => (previousActive === username ? previous : ''));

    sessionStorage.setItem(activeChatKey, username);

    if (username !== '') {
      const conversation = await chat.get({ username });
      setConversations((previous) => ({
        ...previous,
        [username]: conversation,
      }));
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

  const fetchConversations = async () => {
    let fetched: Conversation[] = await chat.getAll();

    // '..' breaks API path endpoints — path traversal sequence
    // todo: remove when the API can handle '..'
    fetched = fetched.filter((f) => f.username !== '..');

    const map: Record<string, Conversation> =
      fetched.length === 0
        ? {}
        : fetched.reduce<Record<string, Conversation>>((accumulator, c) => {
            accumulator[c.username] = c;
            return accumulator;
          }, {});

    const currentActive = activeRef.current;
    const activeConversation = map[currentActive];

    if (activeConversation) {
      if (activeConversation.hasUnAcknowledgedMessages) {
        await acknowledgeMessages(currentActive);
      }

      map[currentActive] = await chat.get({ username: currentActive });
    }

    setConversations(map);

    if (!map[activeRef.current]) {
      void selectConversation(Object.keys(map)[0] ?? '');
    }

    return map;
  };

  const initiateConversation = async (
    username: string,
    initialMessage: string,
  ) => {
    await chat.send({ username, message: initialMessage });
    await fetchConversations();
    void selectConversation(username);
  };

  const deleteConversation = async (username: string) => {
    await chat.remove({ username });
    await fetchConversations();
  };

  const validInput = () => activeRef.current.length > 0 && message.length > 0;

  const sendReply = async () => {
    if (!validInput()) return;
    await chat.send({ username: activeRef.current, message });
    setMessage('');
    void fetchConversations();
  };

  useEffect(() => {
    const savedActive = sessionStorage.getItem(activeChatKey) ?? '';
    activeRef.current = savedActive;
    setActive(savedActive);

    const init = async () => {
      const map = await fetchConversations();
      const toSelect = map[savedActive]
        ? savedActive
        : Object.keys(map)[0] ?? '';
      await selectConversation(toSelect);
    };

    void init();

    const intervalId = window.setInterval(() => fetchConversations(), 5_000);
    return () => clearInterval(intervalId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const messages = conversations[active]?.messages ?? [];

  return (
    <div className="chats">
      <div className="chat-segment">
        <div className="chat-segment-icon" />
        <ChatMenu
          active={active}
          conversations={conversations}
          initiateConversation={initiateConversation}
          onConversationChange={(name: string) => selectConversation(name)}
        />
      </div>
      {active ? (
        <Card className="chat-active-card">
          <CardContent onClick={() => messageRef.current?.focus()}>
            <CardHeader>
              <Circle className="h-3 w-3 text-green-500" />
              {active}
              <button
                className="close-button ml-auto"
                onClick={() => deleteConversation(active)}
                type="button"
              >
                <X className="h-4 w-4 text-red-500" />
              </button>
            </CardHeader>
            <div className="chat relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div>
                  <div
                    className="chat-history"
                    ref={listRef}
                  >
                    <ChatMessageHistory
                      messages={messages}
                      selfUsername={appState.user.username}
                    />
                  </div>
                  <div className="chat-input flex gap-2">
                    <Input
                      autoComplete="off"
                      data-lpignore="true"
                      id="chat-message-input"
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyUp={(event: React.KeyboardEvent) => {
                        if (event.key === 'Enter') void sendReply();
                      }}
                      ref={messageRef}
                      type="text"
                      value={message}
                    />
                    <Button
                      className="chat-message-button"
                      disabled={!validInput()}
                      onClick={() => sendReply()}
                      type="button"
                      variant="ghost"
                    >
                      <Send className="h-4 w-4 text-green-500" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <PlaceholderSegment
          caption="No chats to display"
          icon="comment"
        />
      )}
    </div>
  );
};

export default Chat;
