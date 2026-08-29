import './Dashboard.css';
import * as reports from '../../lib/reports';
import { type ServerState } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import HistoricalStatistics from './HistoricalStatistics';
import SearchBar from './SearchBar';

const HISTORY_RANGES = [
  { buckets: 24, days: 1, label: '24h' },
  { buckets: 84, days: 7, label: '7d' },
  { buckets: 60, days: 30, label: '30d' },
  { buckets: 90, days: 90, label: '90d' },
  { buckets: 90, days: 180, label: '180d' },
  { buckets: 100, days: 365, label: '1y' },
  { buckets: 100, days: null as number | null, label: 'All' },
];

type DashboardData = {
  directories: reports.DirectoryRow[];
  exceptions: {
    download: { pareto: reports.ParetoRow[]; recent: reports.ExceptionRow[] };
    upload: { pareto: reports.ParetoRow[]; recent: reports.ExceptionRow[] };
  };
  histogram: reports.ReportsHistogram;
  leaderboard: {
    download: reports.LeaderboardRow[];
    upload: reports.LeaderboardRow[];
  };
  summary: reports.ReportsSummary;
};

const initialState: DashboardData = {
  directories: [],
  exceptions: {
    download: { pareto: [], recent: [] },
    upload: { pareto: [], recent: [] },
  },
  histogram: {},
  leaderboard: {
    download: [],
    upload: [],
  },
  summary: {},
};

const Dashboard = ({ server }: { readonly server?: ServerState }) => {
  const [loading, setLoading] = useState(true);
  const [historyLabel, setHistoryLabel] = useState('30d');
  const [historyTab, setHistoryTab] = useState(0);
  const [data, setData] = useState<DashboardData>(initialState);

  const historyParameters = useMemo(() => {
    const range =
      HISTORY_RANGES.find((r) => r.label === historyLabel) ?? HISTORY_RANGES[2];
    const now = new Date();
    return {
      buckets: range.buckets,
      end: now.toISOString(),
      start:
        range.days == null
          ? new Date(0).toISOString()
          : new Date(now.getTime() - range.days * 86_400_000).toISOString(),
    };
  }, [historyLabel]);

  const fetchAll = async (parameters: typeof historyParameters) => {
    const start = parameters.start ? new Date(parameters.start) : undefined;
    const end = new Date(parameters.end);

    setLoading(true);

    const [
      summary,
      histogram,
      uploadLeaderboard,
      downloadLeaderboard,
      directories,
      uploadPareto,
      downloadPareto,
      uploadRecent,
      downloadRecent,
    ] = await Promise.all([
      reports.getSummary({ end, start }).catch((error) => {
        console.error(error);
        return {} as reports.ReportsSummary;
      }),
      reports
        .getHistogram({ buckets: parameters.buckets, end, start })
        .catch((error) => {
          console.error(error);
          return {} as reports.ReportsHistogram;
        }),
      reports
        .getLeaderboard({ direction: 'Upload', end, start })
        .catch((error) => {
          console.error(error);
          return [] as reports.LeaderboardRow[];
        }),
      reports
        .getLeaderboard({ direction: 'Download', end, start })
        .catch((error) => {
          console.error(error);
          return [] as reports.LeaderboardRow[];
        }),
      reports.getTopDirectories({ end, start }).catch((error) => {
        console.error(error);
        return [] as reports.DirectoryRow[];
      }),
      reports
        .getExceptionPareto({ direction: 'Upload', end, start })
        .catch((error) => {
          console.error(error);
          return [] as reports.ParetoRow[];
        }),
      reports
        .getExceptionPareto({ direction: 'Download', end, start })
        .catch((error) => {
          console.error(error);
          return [] as reports.ParetoRow[];
        }),
      reports
        .getExceptions({ direction: 'Upload', end, start })
        .catch((error) => {
          console.error(error);
          return [] as reports.ExceptionRow[];
        }),
      reports
        .getExceptions({ direction: 'Download', end, start })
        .catch((error) => {
          console.error(error);
          return [] as reports.ExceptionRow[];
        }),
    ]);

    setData({
      directories,
      exceptions: {
        download: { pareto: downloadPareto, recent: downloadRecent },
        upload: { pareto: uploadPareto, recent: uploadRecent },
      },
      histogram,
      leaderboard: { download: downloadLeaderboard, upload: uploadLeaderboard },
      summary,
    });
    setLoading(false);
  };

  useEffect(() => {
    void fetchAll(historyParameters);
  }, [historyParameters]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="dashboard">
      <SearchBar server={server} />
      <HistoricalStatistics
        activeTab={historyTab}
        directories={data.directories}
        exceptions={data.exceptions}
        histogram={data.histogram}
        historyEnd={historyParameters.end}
        historyLabel={historyLabel}
        historyRanges={HISTORY_RANGES}
        historyStart={historyParameters.start}
        leaderboard={data.leaderboard}
        loading={loading}
        onHistoryRangeSelect={(label) => setHistoryLabel(label)}
        onTabChange={setHistoryTab}
        summary={data.summary}
      />
    </div>
  );
};

export default Dashboard;
