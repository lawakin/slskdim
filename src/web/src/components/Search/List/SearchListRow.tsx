import { type Search } from '../../../lib/searches';
import SearchStatusIcon from '../SearchStatusIcon';
import SearchActionIcon from './SearchActionIcon';
import { TableCell, TableRow } from '@/components/ui/table';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

const SearchListRow = ({
  onRemove,
  onStop,
  search,
}: {
  readonly onRemove: (search: Search) => void;
  readonly onStop: (search: Search) => void;
  readonly search: Search;
}) => {
  const [working, setWorking] = useState(false);
  const match = useRouteMatch();

  const invoke = async (function_: () => unknown) => {
    setWorking(true);
    try {
      await function_();
    } catch (error) {
      console.error(error);
    } finally {
      setWorking(false);
    }
  };

  return (
    <TableRow style={{ cursor: working ? 'wait' : undefined }}>
      <TableCell>
        <SearchStatusIcon state={search.state} />
      </TableCell>
      <TableCell>
        <Link to={`${match.url}/${search.id}`}>{search.searchText}</Link>
      </TableCell>
      <TableCell>{search.fileCount}</TableCell>
      <TableCell>
        <Lock className="mr-1 inline h-3 w-3 text-yellow-500" />
        {search.lockedFileCount}
      </TableCell>
      <TableCell>{search.responseCount}</TableCell>
      <TableCell>
        {search.endedAt ? new Date(search.endedAt).toLocaleTimeString() : '-'}
      </TableCell>
      <TableCell>
        <SearchActionIcon
          loading={working}
          onRemove={() => invoke(() => onRemove(search))}
          onStop={() => invoke(() => onStop(search))}
          search={search}
        />
      </TableCell>
    </TableRow>
  );
};

export default SearchListRow;
