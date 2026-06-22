import {
  filterResponse,
  getResponses,
  parseFiltersFromString,
  type Search,
  type SearchResponse,
} from '../../../lib/searches';
import { sleep } from '../../../lib/util';
import ErrorSegment from '../../Shared/ErrorSegment';
import LoaderSegment from '../../Shared/LoaderSegment';
import Switch from '../../Shared/Switch';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import Response from '../Response';
import SearchDetailHeader from './SearchDetailHeader';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type SortKey = 'uploadSpeed' | 'queueLength';

const sortOptions: Array<{ label: string; value: SortKey }> = [
  { label: 'Upload Speed (Fastest to Slowest)', value: 'uploadSpeed' },
  { label: 'Queue Depth (Least to Most)', value: 'queueLength' },
];

const sortConfig: Record<
  SortKey,
  { field: keyof SearchResponse; order: 'asc' | 'desc' }
> = {
  queueLength: { field: 'queueLength', order: 'asc' },
  uploadSpeed: { field: 'uploadSpeed', order: 'desc' },
};

const SearchDetail = ({
  creating,
  disabled,
  onCreate,
  onRemove,
  onStop,
  removing,
  search,
  stopping,
}: {
  readonly creating: boolean;
  readonly disabled: boolean;
  readonly onCreate: (options: { navigate: boolean; search: string }) => void;
  readonly onRemove: (search: Search) => void;
  readonly onStop: (search: Search) => void;
  readonly removing: boolean;
  readonly search: Search;
  readonly stopping: boolean;
}) => {
  const { fileCount, id, isComplete, lockedFileCount, responseCount, state } =
    search;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(undefined);
  const [results, setResults] = useState<SearchResponse[]>([]);

  const [hiddenResults, setHiddenResults] = useState<string[]>([]);
  const [resultSort, setResultSort] = useState<SortKey>('uploadSpeed');
  const [hideLocked, setHideLocked] = useState(true);
  const [hideNoFreeSlots, setHideNoFreeSlots] = useState(false);
  const [foldResults, setFoldResults] = useState(false);
  const [resultFilters, setResultFilters] = useState('');
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    const get = async () => {
      try {
        setLoading(true);
        // results may not be ready immediately after completion
        await sleep(500);
        const responses = await getResponses({ id });
        setResults(responses ?? []);
        setLoading(false);
      } catch (getError) {
        setError(getError);
        setLoading(false);
      }
    };

    if (isComplete) {
      get();
    }
  }, [id, isComplete]);

  const sortedAndFilteredResults = useMemo(() => {
    const { field, order } = sortConfig[resultSort];
    const filters = parseFiltersFromString(resultFilters);

    return results
      .filter((r) => !hiddenResults.includes(r.username))
      .map((r) =>
        hideLocked ? { ...r, lockedFileCount: 0, lockedFiles: [] } : r,
      )
      .map((response) => filterResponse({ filters, response }))
      .filter((r) => r.fileCount + r.lockedFileCount > 0)
      .filter((r) => !(hideNoFreeSlots && !r.hasFreeUploadSlot))
      .sort((a, b) =>
        order === 'asc'
          ? (a[field] as number) - (b[field] as number)
          : (b[field] as number) - (a[field] as number),
      );
  }, [
    hiddenResults,
    hideLocked,
    hideNoFreeSlots,
    resultFilters,
    resultSort,
    results,
  ]);

  const reset = () => {
    setLoading(false);
    setError(undefined);
    setResults([]);
    setHiddenResults([]);
    setDisplayCount(5);
  };

  const create = async (options: { navigate: boolean; search: string }) => {
    reset();
    onCreate(options);
  };

  const remove = async () => {
    reset();
    onRemove(search);
  };

  const filteredCount = results.length - sortedAndFilteredResults.length;
  const remainingCount = sortedAndFilteredResults.length - displayCount;
  const loaded = !removing && !creating && !loading;

  const renderShowMore = () => {
    if (remainingCount > 0)
      return (
        <Button
          className="showmore-button w-full"
          onClick={() => setDisplayCount(displayCount + 5)}
          size="lg"
        >
          Show {remainingCount > 5 ? 5 : remainingCount} More Results{' '}
          {`(${remainingCount} remaining, ${filteredCount} hidden by filter(s))`}
        </Button>
      );
    if (filteredCount > 0)
      return (
        <Button
          className="showmore-button w-full"
          disabled
          size="lg"
        >
          {`All results shown. ${filteredCount} results hidden by filter(s)`}
        </Button>
      );
    return null;
  };

  if (error) {
    return (
      <ErrorSegment caption={(error as Error)?.message ?? String(error)} />
    );
  }

  return (
    <>
      <SearchDetailHeader
        creating={creating}
        disabled={disabled}
        loaded={loaded}
        loading={loading}
        onCreate={create}
        onRemove={remove}
        onStop={onStop}
        removing={removing}
        search={search}
        stopping={stopping}
      />
      <Switch
        loading={loading && <LoaderSegment />}
        searching={
          !isComplete && (
            <LoaderSegment>
              {state === 'InProgress'
                ? `Found ${fileCount} files ${lockedFileCount > 0 ? `(plus ${lockedFileCount} locked) ` : ''}from ${responseCount} users`
                : 'Loading results...'}
            </LoaderSegment>
          )
        }
      >
        {loaded && (
          <>
            <div className="search-options sticky top-0 z-10 bg-background p-2">
              <div className="flex">
                <Select
                  onValueChange={(v) => setResultSort(v as SortKey)}
                  value={resultSort}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((o) => (
                      <SelectItem
                        key={o.value}
                        value={o.value}
                      >
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="inline-flex">
                  <label
                    className="search-options-hide-locked flex cursor-pointer items-center gap-2 text-sm"
                    htmlFor="hide-locked"
                  >
                    <Checkbox
                      checked={hideLocked}
                      id="hide-locked"
                      onCheckedChange={() => setHideLocked(!hideLocked)}
                    />
                    Hide Locked Results
                  </label>
                  <label
                    className="search-options-hide-no-slots flex cursor-pointer items-center gap-2 text-sm"
                    htmlFor="hide-no-slots"
                  >
                    <Checkbox
                      checked={hideNoFreeSlots}
                      id="hide-no-slots"
                      onCheckedChange={() =>
                        setHideNoFreeSlots(!hideNoFreeSlots)
                      }
                    />
                    Hide Results with No Free Slots
                  </label>
                  <label
                    className="search-options-fold-results flex cursor-pointer items-center gap-2 text-sm"
                    htmlFor="fold-results"
                  >
                    <Checkbox
                      checked={foldResults}
                      id="fold-results"
                      onCheckedChange={() => setFoldResults(!foldResults)}
                    />
                    Fold Results
                  </label>
                </div>
              </div>
              <div className="search-filter relative">
                <Input
                  className={resultFilters ? 'pr-8' : ''}
                  onChange={(event) => setResultFilters(event.target.value)}
                  placeholder="lackluster -bothersome iscbr isvbr islossless minbitrate:320 minbitdepth:24 minfilesize:10 minfif:8"
                  value={resultFilters}
                />
                {resultFilters && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setResultFilters('')}
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            {/* TODO: make this be virtulized using something like react-virtual */}
            <div className="flex flex-col gap-2">
              {sortedAndFilteredResults.slice(0, displayCount).map((r) => (
                <Response
                  disabled={disabled}
                  isInitiallyFolded={foldResults}
                  key={r.username}
                  onHide={() =>
                    setHiddenResults([...hiddenResults, r.username])
                  }
                  response={r}
                />
              ))}
              {renderShowMore()}
            </div>
          </>
        )}
      </Switch>
    </>
  );
};

export default SearchDetail;
