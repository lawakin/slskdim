import './Chat.css';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Plus, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const SendMessageModal = ({
  initiateConversation,
}: {
  readonly initiateConversation: (
    username: string,
    message: string,
  ) => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) usernameRef.current?.focus();
  }, [open]);

  const validInput = () => username.length > 0 && message.length > 0;

  const close = () => {
    setUsername('');
    setMessage('');
    setOpen(false);
  };

  const sendMessage = async () => {
    if (!validInput()) {
      usernameRef.current?.focus();
      return;
    }

    await initiateConversation(username, message);
    close();
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (isOpen) setOpen(true);
        else close();
      }}
      open={open}
    >
      <DialogTrigger
        render={
          <Button
            className="add-button"
            size="icon"
            variant="ghost"
          />
        }
      >
        <Plus className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Private Message
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            onChange={(event) => setUsername(event.target.value)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') void sendMessage();
            }}
            placeholder="Username"
            ref={usernameRef}
            value={username}
          />
          <Input
            onChange={(event) => setMessage(event.target.value)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') void sendMessage();
            }}
            placeholder="Message"
            value={message}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={close}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={!validInput()}
            onClick={() => sendMessage()}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageModal;
