import { getVersion, restart, shutdown } from '../../../lib/application';
import {
  CodeEditor,
  LoaderSegment,
  ShrinkableButton,
  Switch,
} from '../../Shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { type ApplicationState } from '@/types';
import { useEffect, useState } from 'react';
import YAML from 'yaml';

const Info = ({ state }: { readonly state: ApplicationState }) => {
  const [contents, setContents] = useState<string>();
  const [shutdownOpen, setShutdownOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setContents(
        YAML.stringify(state, { simpleKeys: true, sortMapEntries: false }),
      );
    }, 250);
  }, [state]);

  // const { pendingRestart } = state;

  return (
    <>
      <div className="header-buttons">
        <div style={{ float: 'left' }}>
          <ShrinkableButton
            disabled={!contents}
            icon="refresh"
            mediaQuery="(max-width: 686px)"
            onClick={() => getVersion({ forceCheck: true })}
          >
            Check for Updates
          </ShrinkableButton>
          <ShrinkableButton
            disabled={!contents}
            icon="star"
            mediaQuery="(max-width: 686px)"
            onClick={() =>
              window.open(
                `http://www.slsknet.org/qtlogin.php?username=${state?.user?.username}`,
                '_blank',
              )
            }
          >
            Get Privileges
          </ShrinkableButton>
        </div>
        <ShrinkableButton
          disabled={!contents}
          icon="shutdown"
          mediaQuery="(max-width: 686px)"
          onClick={() => setShutdownOpen(true)}
        >
          Shut Down
        </ShrinkableButton>
        <Dialog
          onOpenChange={setShutdownOpen}
          open={shutdownOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Shutdown</DialogTitle>
              <DialogDescription>
                Are you sure you want to shut the application down? You'll need
                to manually start it again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                onClick={shutdown}
                variant="destructive"
              >
                Shut Down
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <ShrinkableButton
          disabled={!contents}
          icon="redo"
          mediaQuery="(max-width: 686px)"
          onClick={() => setRestartOpen(true)}
        >
          Restart
        </ShrinkableButton>
        <Dialog
          onOpenChange={setRestartOpen}
          open={restartOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Restart</DialogTitle>
              <DialogDescription>
                Are you sure you want to restart the application?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                onClick={restart}
                variant="destructive"
              >
                Restart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Separator />
      <Switch loading={!contents && <LoaderSegment />}>
        <CodeEditor
          basicSetup={false}
          editable={false}
          // theme={theme}
          // eslint-disable-next-line no-warning-comments
          // TODO: fix thisssss
          theme="dark"
          value={contents}
        />
      </Switch>
    </>
  );
};

export default Info;
