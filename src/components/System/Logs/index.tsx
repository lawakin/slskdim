import '../System.css';
import { createLogsHubConnection } from '../../../lib/hubFactory';
import { LoaderSegment } from '../../Shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { useEffect, useState } from 'react';

type LogLevel = 'Debug' | 'Information' | 'Warning' | 'Error';

type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
};

const levels: Record<LogLevel, string> = {
  Debug: 'DBG',
  Error: 'ERR',
  Information: 'INF',
  Warning: 'WRN',
};

const MAX_LOGS = 500;

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

const rowClass = (level: LogLevel) => {
  if (level === 'Error') return 'text-red-500';
  if (level === 'Warning') return 'text-yellow-500';
  if (level === 'Debug') return 'opacity-50';
  return '';
};

const Logs = () => {
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const logsHub = createLogsHubConnection();

    logsHub.on('buffer', (buffer: LogEntry[]) => {
      setConnected(true);
      setLogs(buffer.reverse().slice(0, MAX_LOGS));
    });

    logsHub.on('log', (log: LogEntry) => {
      setConnected(true);
      setLogs((previous) => [log, ...previous].slice(0, MAX_LOGS));
    });

    logsHub.onreconnecting(() => setConnected(false));
    logsHub.onclose(() => setConnected(false));
    logsHub.onreconnected(() => setConnected(true));

    logsHub.start();
  }, []);

  return (
    <div className="logs">
      {!connected && <LoaderSegment />}
      {connected && (
        <Table className="logs-table">
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="logs-table-body">
            {logs.map((log) => (
              <TableRow
                className={rowClass(log.level)}
                key={log.timestamp}
              >
                <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                <TableCell>{levels[log.level] ?? log.level}</TableCell>
                <TableCell className="logs-table-message">
                  {log.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Logs;
