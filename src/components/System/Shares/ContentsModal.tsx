import { browse, type Share } from '../../../lib/shares';
import { CodeEditor, LoaderSegment, Switch } from '../../Shared';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { useEffect, useState } from 'react';

const ContentsModal = ({
  onClose,
  share,
}: {
  readonly onClose: () => void;
  readonly share?: Share;
}) => {
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<string>('');

  const { id, localPath, remotePath } = share ?? {};

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);

      const result = await browse({ id });

      const directories = result.map((directory) => {
        const lines = [directory.name.replace(remotePath, localPath)];
        const sorted = [...directory.files].sort((a, b) =>
          a.filename.localeCompare(b.filename),
        );
        for (const file of sorted) {
          lines.push('\t' + file.filename.replace(remotePath, ''));
        }

        lines.push('');
        return lines.join('\n');
      });

      setContents(directories.join('\n'));
      setLoading(false);
    };

    if (id) {
      fetch();
    } else {
      setLoading(true);
      setContents('');
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      open={Boolean(share)}
    >
      <DialogContent className="flex max-w-4xl flex-col gap-0 p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle>{localPath}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4">
          <Switch loading={loading && <LoaderSegment />}>
            <CodeEditor
              basicSetup={false}
              editable={false}
              style={{ minHeight: 500 }}
              theme="dark"
              value={contents}
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

export default ContentsModal;
