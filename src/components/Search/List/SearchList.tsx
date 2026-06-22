import type * as library from '../../../lib/searches';
import ErrorSegment from '../../Shared/ErrorSegment';
import Switch from '../../Shared/Switch';
import SearchListRow from './SearchListRow';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Info } from 'lucide-react';

const SearchList = ({
  connecting = false,
  error = undefined,
  onRemove,
  onStop,
  searches = {},
}: {
  readonly connecting: boolean;
  readonly error?: string;
  readonly onRemove: (search: library.Search) => void;
  readonly onStop: (search: library.Search) => void;
  readonly searches: Record<string, library.Search>;
}) => {
  return (
    <Card
      className="search-list-card"
      // raised
    >
      <CardContent>
        <div className="search-list-wrapper">
          <Switch
            connecting={
              connecting && (
                // <Loader
                //   active
                //   inline="centered"
                //   size="small"
                // />
                <div />
              )
            }
            error={error && <ErrorSegment caption={error} />}
          >
            <Table
              className="unstackable"
              // size="large"
            >
              <TableHeader>
                <TableRow>
                  <TableHead className="search-list-action">
                    <Info />
                  </TableHead>
                  <TableHead className="search-list-phrase">Search</TableHead>
                  <TableHead className="search-list-files">Files</TableHead>
                  <TableHead className="search-list-locked">Locked</TableHead>
                  <TableHead className="search-list-responses">
                    Responses
                  </TableHead>
                  <TableHead className="search-list-started">Ended</TableHead>
                  <TableHead className="search-list-action" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(searches)
                  .sort(
                    (a, b) =>
                      Number(new Date(b.startedAt)) -
                      Number(new Date(a.startedAt)),
                  )
                  .map((search) => (
                    <SearchListRow
                      key={search.id}
                      onRemove={onRemove}
                      onStop={onStop}
                      search={search}
                    />
                  ))}
              </TableBody>
            </Table>
          </Switch>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchList;
