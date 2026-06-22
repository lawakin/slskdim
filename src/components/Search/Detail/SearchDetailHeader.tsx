import { type Search } from '../../../lib/searches';
import ShrinkableButton from '../../Shared/ShrinkableButton';
import SearchStatusIcon from '../SearchStatusIcon';
import { RefreshCw, StopCircle, Trash2 } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';

const SearchDetailHeader = ({
  creating,
  disabled,
  loaded,
  loading,
  onCreate,
  onRemove,
  onStop,
  removing,
  search,
  stopping,
}: {
  readonly creating: boolean;
  readonly disabled: boolean;
  readonly loaded: boolean;
  readonly loading: boolean;
  readonly onCreate: (options: { navigate: boolean; search: string }) => void;
  readonly onRemove: () => void;
  readonly onStop: (search: Search) => void;
  readonly removing: boolean;
  readonly search: Search;
  readonly stopping: boolean;
}) => {
  const isTinyScreen = useMediaQuery({ query: '(max-width: 684px)' });

  const { isComplete, searchText, state } = search;
  const working = loading || creating || removing || stopping;

  const stopOrRemove = () => {
    if (isComplete) {
      onRemove();
    } else {
      onStop(search);
    }
  };

  const buttons = (
    <>
      {loaded && (
        <ShrinkableButton
          disabled={disabled || working}
          icon={<RefreshCw className="h-4 w-4" />}
          loading={creating}
          mediaQuery="(max-width: 899px)"
          onClick={() => onCreate({ navigate: true, search: searchText })}
        >
          Search Again
        </ShrinkableButton>
      )}
      <ShrinkableButton
        disabled={working}
        icon={
          isComplete ? (
            <Trash2 className="h-4 w-4" />
          ) : (
            <StopCircle className="h-4 w-4" />
          )
        }
        loading={removing || stopping}
        mediaQuery="(max-width: 899px)"
        onClick={stopOrRemove}
        variant="destructive"
      >
        {loaded && isComplete ? 'Delete' : 'Stop'}
      </ShrinkableButton>
    </>
  );

  return (
    <>
      <div className="search-detail-header-segment">
        <div className="flex items-center gap-2">
          <SearchStatusIcon state={state} />
          <span className="font-semibold">{searchText}</span>
        </div>
        {!isTinyScreen && (
          <div className="search-detail-header-buttons">{buttons}</div>
        )}
      </div>
      {isTinyScreen && (
        <div className="search-detail-header-buttons">{buttons}</div>
      )}
    </>
  );
};

export default SearchDetailHeader;
