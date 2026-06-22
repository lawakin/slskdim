import { Switch } from '../../Shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Folder } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const ShareTable = ({ onClick, shares }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Host</TableHead>
          <TableHead>Local Path</TableHead>
          <TableHead className="share-count-column">Directories</TableHead>
          <TableHead className="share-count-column">Files</TableHead>
          <TableHead>Alias</TableHead>
          <TableHead>Remote Path</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <Switch
          empty={
            shares.length === 0 && (
              <TableRow>
                <TableCell
                  className="empty-state-cell"
                  colSpan={6}
                >
                  No shares configured
                </TableCell>
              </TableRow>
            )
          }
        >
          {shares.map((share) => (
            <TableRow key={`${share.host}+${share.localPath}`}>
              <TableCell>{share.host}</TableCell>
              <TableCell onClick={() => onClick(share)}>
                <Folder />
                <Link to="#">{share.localPath}</Link>
              </TableCell>
              <TableCell>{share.directories ?? '?'}</TableCell>
              <TableCell>{share.files ?? '?'}</TableCell>
              <TableCell>{share.alias}</TableCell>
              <TableCell>{share.remotePath}</TableCell>
            </TableRow>
          ))}
        </Switch>
      </TableBody>
    </Table>
  );
};

export default ShareTable;
