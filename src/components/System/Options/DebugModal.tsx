import { getCurrentDebugView } from '../../../lib/options';
import { CodeEditor, PlaceholderSegment, Switch } from '../../Shared';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { useEffect, useState } from 'react';
import { toErrorMessage } from '@/lib/utils';
import { toast } from 'react-toastify';

const DebugModal = ({
  onClose,
  open,
}: {
  readonly onClose: () => void;
  readonly open: boolean;
}) => {
  const [loading, setLoading] = useState(true);
  const [debugView, setDebugView] = useState<string | undefined>();

  const get = async () => {
    setLoading(true);
    try {
      setDebugView(await getCurrentDebugView());
    } catch (error) {
      console.error(error);
      toast.error(toErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) get();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      open={open}
    >
      <DialogContent className="flex max-w-4xl flex-col gap-0 p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle>Options (Debug View)</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4">
          <Switch loading={loading && <PlaceholderSegment />}>
            <CodeEditor
              basicSetup={false}
              editable={false}
              style={{ minHeight: 500 }}
              theme="dark"
              value={debugView}
            />
          </Switch>
        </div>
        <DialogFooter className="border-t p-4">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DebugModal;
