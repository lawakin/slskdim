import {
  getYaml,
  getYamlLocation,
  updateYaml,
  validateYaml,
} from '../../../lib/options';
import { PlaceholderSegment, Switch } from '../../Shared';
import CodeEditor from '../../Shared/CodeEditor';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { useEffect, useState } from 'react';

const EditModal = ({
  onClose,
  open,
}: {
  readonly onClose: () => void;
  readonly open: boolean;
}) => {
  // eslint-disable-next-line react/hook-use-state
  const [{ error, loading }, setLoading] = useState({
    error: false as boolean | string,
    loading: true,
  });
  // eslint-disable-next-line react/hook-use-state
  const [{ isDirty, location, yaml }, setYaml] = useState<{
    isDirty: boolean;
    location: string | undefined;
    yaml: string | undefined;
  }>({
    isDirty: false,
    location: undefined,
    yaml: undefined,
  });
  const [yamlError, setYamlError] = useState<string | undefined>();
  const [updateError, setUpdateError] = useState<string | undefined>();

  const get = async () => {
    setLoading({ error: false, loading: true });
    try {
      const [locationResult, yamlResult] = await Promise.all([
        getYamlLocation(),
        getYaml(),
      ]);
      setYaml({ isDirty: false, location: locationResult, yaml: yamlResult });
      setLoading({ error: false, loading: false });
    } catch (getError) {
      setLoading({ error: (getError as Error).message, loading: false });
    }
  };

  const validate = async (newYaml: string) => {
    const response = await validateYaml({ yaml: newYaml });
    setYamlError(response);
  };

  const update = async (newYaml: string) => {
    setYaml({ isDirty: true, location, yaml: newYaml });
    validate(newYaml);
  };

  const save = async () => {
    if (!yaml) return;
    await validate(yaml);
    if (!yamlError) {
      try {
        await updateYaml({ yaml });
        onClose();
      } catch (nextUpdateError) {
        setUpdateError(
          (nextUpdateError as { response: { data: string } }).response.data,
        );
      }
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
          <DialogTitle>Edit Options</DialogTitle>
          {!loading && location && (
            <p className="text-sm text-muted-foreground">Editing {location}</p>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4">
          <Switch
            error={error && <PlaceholderSegment icon="close" />}
            loading={loading && <PlaceholderSegment />}
          >
            <div
              className={
                yamlError || updateError
                  ? 'edit-code-container-error'
                  : 'edit-code-container'
              }
            >
              <CodeEditor
                onChange={(value) => update(value ?? '')}
                style={{ minHeight: 500 }}
                theme="dark"
                value={yaml}
              />
            </div>
          </Switch>
        </div>
        <DialogFooter className="border-t p-4">
          {(yamlError || updateError) && (
            <p className="mr-auto text-sm text-destructive">
              {(yamlError ?? '') + (updateError ?? '')}
            </p>
          )}
          <Button
            disabled={!isDirty}
            onClick={save}
          >
            Save
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditModal;
