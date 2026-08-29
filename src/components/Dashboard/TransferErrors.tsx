import * as reports from '../../lib/reports';
import { type ExceptionRow, type ParetoRow } from '../../lib/reports';
import { TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Graph, type GraphSeries } from '../Shared';
import ExceptionList from './ExceptionList';
import ExceptionPareto from './ExceptionPareto';

type ExceptionBucket = { pareto: ParetoRow[]; recent: ExceptionRow[] };

const buildParetoRows = (
  uploadRows: ParetoRow[] | undefined,
  downloadRows: ParetoRow[] | undefined,
): ParetoRow[] =>
  [
    ...(uploadRows || []).map((r) => ({ ...r, direction: 'Upload' })),
    ...(downloadRows || []).map((r) => ({ ...r, direction: 'Download' })),
  ]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

const mergeRecent = (
  uploadRows: ExceptionRow[] | undefined,
  downloadRows: ExceptionRow[] | undefined,
): ExceptionRow[] =>
  [
    ...(uploadRows || []).map((r) => ({ ...r, direction: 'Upload' })),
    ...(downloadRows || []).map((r) => ({ ...r, direction: 'Download' })),
  ]
    .sort(
      (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
    )
    .slice(0, 10);

const ERRORS_SERIES: GraphSeries[] = [
  {
    color: '#db2828',
    format: (v) => v.toLocaleString(),
    key: 'uploadErrors',
    name: 'Upload Errors',
    unit: 'count',
  },
  {
    color: '#a333c8',
    format: (v) => v.toLocaleString(),
    key: 'downloadErrors',
    name: 'Download Errors',
    unit: 'count',
  },
];

const DEFAULT_ERRORS_SERIES = new Set(['uploadErrors', 'downloadErrors']);

const RECENT_PAGE_SIZE = 10;

const TransferErrors = ({
  chartData,
  download,
  end,
  start,
  upload,
}: {
  readonly chartData?: Array<Record<string, number>>;
  readonly download: ExceptionBucket;
  readonly end: string;
  readonly start?: string;
  readonly upload: ExceptionBucket;
}) => {
  const [paretoDirection, setParetoDirection] = useState('All');
  const [paretoRows, setParetoRows] = useState<ParetoRow[] | null>(null);
  const [paretoLoading, setParetoLoading] = useState(false);

  const [recentDirection, setRecentDirection] = useState('All');
  const [recentRows, setRecentRows] = useState<ExceptionRow[] | null>(null);
  const [recentLoading, setRecentLoading] = useState(false);

  useEffect(() => {
    setParetoDirection('All');
    setParetoRows(null);
    setRecentDirection('All');
    setRecentRows(null);
  }, [end, start]);

  const initialParetoRows = useMemo(
    () => buildParetoRows(upload.pareto, download.pareto),
    [upload.pareto, download.pareto],
  );

  const initialRecentRows = useMemo(
    () => mergeRecent(upload.recent, download.recent),
    [upload.recent, download.recent],
  );

  const displayedParetoRows = paretoRows ?? initialParetoRows;
  const displayedRecentRows = recentRows ?? initialRecentRows;

  const fetchPareto = async (direction: string): Promise<ParetoRow[]> => {
    try {
      return await reports.getExceptionPareto({
        direction: direction as reports.TransferDirection,
        end: new Date(end),
        start: start ? new Date(start) : undefined,
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const fetchRecent = async (direction: string): Promise<ExceptionRow[]> => {
    try {
      return await reports.getExceptions({
        direction: direction as reports.TransferDirection,
        end: new Date(end),
        limit: RECENT_PAGE_SIZE,
        start: start ? new Date(start) : undefined,
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const onParetoDirectionChange = async (d: string) => {
    setParetoDirection(d);
    setParetoLoading(true);

    try {
      if (d === 'All') {
        const [uploadRows, downloadRows] = await Promise.all([
          fetchPareto('Upload'),
          fetchPareto('Download'),
        ]);
        setParetoRows(buildParetoRows(uploadRows, downloadRows));
      } else {
        const rows = await fetchPareto(d);
        setParetoRows(rows.map((r) => ({ ...r, direction: d })));
      }
    } finally {
      setParetoLoading(false);
    }
  };

  const onRecentDirectionChange = async (d: string) => {
    setRecentDirection(d);
    setRecentLoading(true);

    try {
      if (d === 'All') {
        const [uploadRows, downloadRows] = await Promise.all([
          fetchRecent('Upload'),
          fetchRecent('Download'),
        ]);
        setRecentRows(mergeRecent(uploadRows, downloadRows));
      } else {
        const rows = await fetchRecent(d);
        setRecentRows(rows.map((r) => ({ ...r, direction: d })));
      }
    } finally {
      setRecentLoading(false);
    }
  };

  return (
    <div>
      <h5 className="mb-2 flex items-center gap-2 font-medium">
        <TriangleAlert className="h-4 w-4" /> Errors
      </h5>
      <Graph
        data={chartData ?? []}
        defaultSeries={DEFAULT_ERRORS_SERIES}
        series={ERRORS_SERIES}
      />
      <ExceptionPareto
        direction={paretoDirection}
        loading={paretoLoading}
        onDirectionChange={onParetoDirectionChange}
        rows={displayedParetoRows}
      />
      <ExceptionList
        direction={recentDirection}
        loading={recentLoading}
        onDirectionChange={onRecentDirectionChange}
        rows={displayedRecentRows}
      />
    </div>
  );
};

export default TransferErrors;
