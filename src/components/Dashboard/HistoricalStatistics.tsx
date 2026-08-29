import {
  type DirectoryRow,
  type ExceptionRow,
  type LeaderboardRow,
  type ParetoRow,
  type ReportsHistogram,
  type ReportsSummary,
  type TransferStat,
} from '../../lib/reports';
import { formatBytes, formatSpeed, formatWait } from '../../lib/util';
import {
  ArrowDown,
  ArrowUp,
  ChartPie,
  FolderOpen,
  History,
  TriangleAlert,
  User,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { Graph, type GraphSeries, LoaderSegment } from '../Shared';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Leaderboard from './Leaderboard';
import TopDirectories from './TopDirectories';
import TransferErrors from './TransferErrors';

const formatBytesParts = (bytes: number): { unit: string; value: string } => {
  if (!bytes || bytes === 0) return { unit: 'B', value: '0' };
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1_024));
  return { unit: units[index], value: (bytes / 1_024 ** index).toFixed(1) };
};

const sumCounts = (directionData: Record<string, TransferStat> = {}): number =>
  Object.values(directionData).reduce((sum, s) => sum + (s.count ?? 0), 0);

const sumBytes = (directionData: Record<string, TransferStat> = {}): number =>
  Object.values(directionData).reduce(
    (sum, s) => sum + (s.totalBytes ?? 0),
    0,
  );

const errorCount = (directionData: Record<string, TransferStat> = {}): number =>
  (directionData.Errored?.count ?? 0) +
  (directionData.Cancelled?.count ?? 0) +
  (directionData.TimedOut?.count ?? 0);

const buildChartData = (
  histogram: ReportsHistogram,
): Array<Record<string, number>> =>
  Object.entries(histogram)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([timestamp, directions]) => {
      const uploadBytes = sumBytes(directions.Upload ?? {});
      const downloadBytes = sumBytes(directions.Download ?? {});
      const uploadCount = sumCounts(directions.Upload ?? {});
      const downloadCount = sumCounts(directions.Download ?? {});
      const uploadErrors = errorCount(directions.Upload ?? {});
      const downloadErrors = errorCount(directions.Download ?? {});
      return {
        downloadBytes,
        downloadCount,
        downloadErrorRate:
          downloadCount > 0 ? (downloadErrors / downloadCount) * 100 : 0,
        downloadErrors,
        downloadSpeed: directions.Download?.Succeeded?.averageSpeed ?? 0,
        shareRatio: downloadBytes > 0 ? uploadBytes / downloadBytes : 0,
        timestamp: new Date(timestamp).getTime(),
        uploadBytes,
        uploadCount,
        uploadErrorRate:
          uploadCount > 0 ? (uploadErrors / uploadCount) * 100 : 0,
        uploadErrors,
        uploadSpeed: directions.Upload?.Succeeded?.averageSpeed ?? 0,
        uploadWait: directions.Upload?.Succeeded?.averageWait ?? 0,
      };
    });

const HISTORY_SERIES: GraphSeries[] = [
  {
    color: '#21ba45',
    format: (v) => formatBytes(v, 1),
    key: 'uploadBytes',
    name: 'Upload Size',
    unit: 'bytes',
  },
  {
    color: '#2185d0',
    format: (v) => formatBytes(v, 1),
    key: 'downloadBytes',
    name: 'Download Size',
    unit: 'bytes',
  },
  {
    color: '#6435c9',
    format: (v) => v.toLocaleString(),
    key: 'uploadCount',
    name: 'Upload Count',
    unit: 'count',
  },
  {
    color: '#e03997',
    format: (v) => v.toLocaleString(),
    key: 'downloadCount',
    name: 'Download Count',
    unit: 'count',
  },
  {
    color: '#f2711c',
    format: formatSpeed,
    key: 'uploadSpeed',
    name: 'Upload Speed',
    unit: 'speed',
  },
  {
    color: '#fbbd08',
    format: formatSpeed,
    key: 'downloadSpeed',
    name: 'Download Speed',
    unit: 'speed',
  },
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
  {
    color: '#d4500a',
    format: (v) => `${v.toFixed(1)}%`,
    key: 'uploadErrorRate',
    name: 'Upload Error Rate',
    unit: 'rate',
  },
  {
    color: '#1aa9b0',
    format: (v) => `${v.toFixed(1)}%`,
    key: 'downloadErrorRate',
    name: 'Download Error Rate',
    unit: 'rate',
  },
  {
    color: '#8e44ad',
    format: formatWait,
    key: 'uploadWait',
    name: 'Upload Queue Wait',
    unit: 'seconds',
  },
  {
    color: '#b5cc18',
    format: (v) => v.toFixed(2),
    key: 'shareRatio',
    name: 'Share Ratio',
    unit: 'ratio',
  },
];

const DEFAULT_HISTORY_SERIES = new Set(['uploadBytes', 'downloadBytes']);

const TAB_KEYS = ['users', 'content', 'errors'];

const StatTile = ({
  colorClass = '',
  icon,
  label,
  unit,
  value,
}: {
  readonly colorClass?: string;
  readonly icon: React.ReactNode;
  readonly label: React.ReactNode;
  readonly unit?: string;
  readonly value: React.ReactNode;
}) => (
  <div className="flex flex-col items-center text-center">
    <div className={`flex items-center gap-1 text-2xl font-semibold ${colorClass}`}>
      {icon}
      <span>{value}</span>
      {unit && <span className="text-[0.5em] text-muted-foreground">{unit}</span>}
    </div>
    <div className="mt-1 text-xs text-muted-foreground">{label}</div>
  </div>
);

const HistoricalStatistics = ({
  activeTab,
  directories,
  exceptions,
  histogram,
  historyEnd,
  historyLabel,
  historyRanges,
  historyStart,
  leaderboard,
  loading,
  onHistoryRangeSelect,
  onTabChange,
  summary,
}: {
  readonly activeTab: number;
  readonly directories: DirectoryRow[];
  readonly exceptions: {
    download: { pareto: ParetoRow[]; recent: ExceptionRow[] };
    upload: { pareto: ParetoRow[]; recent: ExceptionRow[] };
  };
  readonly histogram: ReportsHistogram;
  readonly historyEnd: string;
  readonly historyLabel: string;
  readonly historyRanges: Array<{ label: string }>;
  readonly historyStart?: string;
  readonly leaderboard: {
    download: LeaderboardRow[];
    upload: LeaderboardRow[];
  };
  readonly loading: boolean;
  readonly onHistoryRangeSelect: (label: string) => void;
  readonly onTabChange: (index: number) => void;
  readonly summary: ReportsSummary;
}) => {
  const chartData = useMemo(() => buildChartData(histogram), [histogram]);

  const dlBytes = sumBytes(summary.Download ?? {});
  const ulBytes = sumBytes(summary.Upload ?? {});
  const shareRatio = dlBytes > 0 ? ulBytes / dlBytes : null;
  const shareRatioColor =
    shareRatio === null
      ? 'text-muted-foreground'
      : shareRatio > 0.66
        ? 'text-good'
        : shareRatio >= 0.33
          ? 'text-yellow-500'
          : 'text-red-500';

  const downloadedParts = formatBytesParts(dlBytes);
  const uploadedParts = formatBytesParts(ulBytes);

  return (
    <Card>
      <CardContent>
        {loading && <LoaderSegment />}
        {!loading && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-medium">
                <History className="h-4 w-4" />
                History
              </h4>
              <div className="flex gap-1">
                {historyRanges.map(({ label }) => (
                  <Button
                    key={label}
                    onClick={() => onHistoryRangeSelect(label)}
                    size="sm"
                    variant={historyLabel === label ? 'default' : 'outline'}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatTile
                colorClass="text-primary"
                icon={<ArrowDown className="h-4 w-4" />}
                label={
                  <>
                    Downloaded · {sumCounts(summary.Download ?? {}).toLocaleString()}{' '}
                    files
                  </>
                }
                unit={downloadedParts.unit}
                value={downloadedParts.value}
              />
              <StatTile
                colorClass="text-good"
                icon={<ArrowUp className="h-4 w-4" />}
                label={
                  <>
                    Uploaded · {sumCounts(summary.Upload ?? {}).toLocaleString()}{' '}
                    files
                  </>
                }
                unit={uploadedParts.unit}
                value={uploadedParts.value}
              />
              <StatTile
                colorClass={shareRatioColor}
                icon={<ChartPie className="h-4 w-4" />}
                label="Share ratio (↑/↓)"
                value={shareRatio === null ? '—' : shareRatio.toFixed(2)}
              />
              <StatTile
                icon={<User className="h-4 w-4" />}
                label="Distinct peers"
                value={(
                  (summary.Upload?.Succeeded?.distinctUsers ?? 0) +
                  (summary.Download?.Succeeded?.distinctUsers ?? 0)
                ).toLocaleString()}
              />
            </div>
            <div className="mt-6">
              <Graph
                data={chartData}
                defaultSeries={DEFAULT_HISTORY_SERIES}
                series={HISTORY_SERIES}
              />
            </div>
            <Tabs
              className="mt-4"
              onValueChange={(value) =>
                onTabChange(Math.max(0, TAB_KEYS.indexOf(value)))
              }
              value={TAB_KEYS[activeTab] ?? 'users'}
            >
              <TabsList>
                <TabsTrigger value="users">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="content">
                  <FolderOpen className="h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="errors">
                  <TriangleAlert className="h-4 w-4" />
                  Errors
                </TabsTrigger>
              </TabsList>
              <TabsContent value="users">
                <Leaderboard
                  downloads={leaderboard.download}
                  end={historyEnd}
                  start={historyStart}
                  uploads={leaderboard.upload}
                />
              </TabsContent>
              <TabsContent value="content">
                <TopDirectories rows={directories} />
              </TabsContent>
              <TabsContent value="errors">
                <TransferErrors
                  chartData={chartData}
                  download={exceptions.download}
                  end={historyEnd}
                  start={historyStart}
                  upload={exceptions.upload}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalStatistics;
