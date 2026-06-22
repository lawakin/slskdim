import { clearCompleted } from '../../../lib/transfers';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Direction = 'upload' | 'download';

const clear = async ({
  direction,
  setState,
}: {
  direction: Direction;
  setState: (v: boolean) => void;
}) => {
  setState(true);
  await clearCompleted({ direction });
  setState(false);
  toast.success(`Completed ${direction}s cleared!`);
};

const Data = () => {
  const [up, setUp] = useState(false);
  const [down, setDown] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="transfer-header">Transfer Data</h3>
      <Separator />
      <p>
        The Uploads and Downloads pages can become unresponsive if too many
        transfers are displayed. If you're having trouble with either page, try
        using the buttons below to remove completed transfers.
      </p>
      <div className="flex gap-2">
        <Button
          disabled={up}
          onClick={() => clear({ direction: 'upload', setState: setUp })}
        >
          {up ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Clear All Completed Uploads
        </Button>
        <Button
          disabled={down}
          onClick={() => clear({ direction: 'download', setState: setDown })}
        >
          {down ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Clear All Completed Downloads
        </Button>
      </div>
    </div>
  );
};

export default Data;
