import * as sharesLibrary from '../../../lib/shares';
import { type Share } from '../../../lib/shares';
import { LoaderSegment, ShrinkableButton, Switch } from '../../Shared';
import ContentsModal from './ContentsModal';
import ExclusionTable from './ExclusionTable';
import ShareTable from './ShareTable';
import { Separator } from '@/components/ui/separator';
import { type ShareState } from '@/types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const ScanButton = ({ rescan, working }) => (
  <ShrinkableButton
    /* color={scanPending ? 'yellow' : undefined} */
    disabled={working}
    icon="refresh"
    loading={working}
    mediaQuery="(max-width: 516px)"
    onClick={() => rescan()}
    // primary={!scanPending}
  >
    Rescan Shares
  </ShrinkableButton>
);

const CancelButton = ({ cancel, working }) => (
  <ShrinkableButton
    // color="red"
    disabled={working}
    icon="x"
    mediaQuery="(max-width: 516px)"
    onClick={() => cancel()}
  >
    Cancel Scan
  </ShrinkableButton>
);

const Shares = ({ state }: { readonly state?: ShareState }) => {
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [shares, setShares] = useState([]);
  const [modal, setModal] = useState<Share | undefined>();

  const {
    directories = 0,
    files = 0,
    scanPending = false,
    scanProgress = 0,
    scanning = false,
  } = state ?? {};

  const getAll = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);

      const sharesByHost = await sharesLibrary.getAll();
      const flattened = Object.entries(sharesByHost).reduce(
        (accumulator, [host, sharesForHost]) => {
          return accumulator.concat(
            sharesForHost.map((share) => ({ host, ...share })),
          );
        },
        [],
      );

      setShares(flattened);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data ?? error?.message ?? error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAll();
  }, []);

  useEffect(() => {
    getAll(true);

    if (!scanning) {
      // the state change out of scanning can fire before
      // shares are updated, which leaves them stale. wait a second
      // and fetch again.
      setTimeout(() => getAll(true), 1_000);
    }
  }, [scanPending, scanning]);

  const rescan = async () => {
    try {
      setWorking(true);
      await sharesLibrary.rescan();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data ?? error?.message ?? error);
    } finally {
      setWorking(false);
    }
  };

  const cancel = async () => {
    try {
      setWorking(true);
      await sharesLibrary.cancel();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data ??
          error?.message ??
          error ??
          'Failed to cancel the scan',
      );
    } finally {
      setWorking(false);
    }
  };

  const shared = shares.filter((share) => !share.isExcluded);
  const excluded = shares.filter((share) => share.isExcluded);

  return (
    <Switch loading={loading && <LoaderSegment />}>
      <div className="header-buttons">
        <Switch
          scanning={
            scanning && (
              <CancelButton
                cancel={cancel}
                working={working}
              />
            )
          }
        >
          <ScanButton
            rescan={rescan}
            // scanPending={scanPending}
            working={working}
          />
        </Switch>
      </div>
      <Separator />
      <Switch
        filling={
          scanning && (
            <LoaderSegment>
              <div>
                <div>{Math.round(scanProgress * 100)}%</div>
                <div className="share-scan-detail">
                  Found {files} files in {directories} directories
                </div>
              </div>
            </LoaderSegment>
          )
        }
      >
        <ShareTable
          onClick={setModal}
          shares={shared}
        />
        <ExclusionTable exclusions={excluded} />
      </Switch>
      <ContentsModal
        onClose={() => setModal(undefined)}
        share={modal}
        // theme={theme}
      />
    </Switch>
  );
};

export default Shares;
