import { type Search } from '../../../lib/searches';
import { Loader2, StopCircle, Trash2 } from 'lucide-react';

const SearchActionIcon = ({
  loading,
  onRemove,
  onStop,
  search,
}: {
  readonly loading: boolean;
  readonly onRemove: () => void;
  readonly onStop: () => void;
  readonly search: Search;
}) => {
  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (search.state.includes('Completed')) {
    return (
      <button
        onClick={onRemove}
        type="button"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </button>
    );
  }

  return (
    <button
      onClick={onStop}
      type="button"
    >
      <StopCircle className="h-4 w-4 text-red-500" />
    </button>
  );
};

export default SearchActionIcon;
