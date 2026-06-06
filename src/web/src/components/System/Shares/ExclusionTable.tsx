import { Switch } from '../../Shared';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Table, X } from 'lucide-react';

const ExclusionTable = ({ exclusions = [] } = {}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Excluded Paths</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <Switch
          empty={
            exclusions.length === 0 && (
              <TableRow>
                <TableCell
                  style={{
                    opacity: 0.5,
                    padding: '10px !important',
                    textAlign: 'center',
                  }}
                >
                  No exclusions configured
                </TableCell>
              </TableRow>
            )
          }
        >
          {exclusions.map((share) => (
            <TableRow key={share.localPath}>
              <TableCell>
                <X />
                {share.localPath}
              </TableCell>
            </TableRow>
          ))}
        </Switch>
      </TableBody>
    </Table>
  );
};

export default ExclusionTable;
