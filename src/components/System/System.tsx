import './System.css';
import { urlBase } from '../../config';
import { type ApplicationOptions, type ApplicationState } from '../../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Appearance from './Appearance';
import Data from './Data';
import Events from './Events';
import Files from './Files';
import Info from './Info';
import Logs from './Logs';
import Options from './Options';
import Shares from './Shares';
import { CircleAlert } from 'lucide-react';
import { Redirect, useHistory, useRouteMatch } from 'react-router-dom';

const System = ({
  options = {},
  state = {},
  theme = '',
}: {
  readonly options?: ApplicationOptions;
  readonly state?: ApplicationState;
  readonly theme?: string;
}) => {
  const {
    params: { tab },
    ...route
  } = useRouteMatch<{ tab?: string }>();
  const history = useHistory();

  const pendingInfo =
    (state?.pendingRestart ?? false) || (state?.pendingReconnect ?? false);
  const pendingShares = state?.shares?.scanPending ?? false;

  if (tab === undefined) {
    return <Redirect to={`${route.url}/info`} />;
  }

  return (
    <div className="system">
      <Tabs
        onValueChange={(value) => history.push(`${urlBase}/system/${value}`)}
        value={tab}
      >
        <TabsList>
          <TabsTrigger value="info">
            {pendingInfo && (
              <CircleAlert className="mr-1 h-3 w-3 text-yellow-500" />
            )}
            Info
          </TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="shares">
            {pendingShares && (
              <CircleAlert className="mr-1 h-3 w-3 text-yellow-500" />
            )}
            Shares
          </TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Info state={state} />
        </TabsContent>
        <TabsContent value="options">
          <Options
            options={options}
            theme={theme}
          />
        </TabsContent>
        <TabsContent value="shares">
          <Shares state={state.shares} />
        </TabsContent>
        <TabsContent value="files">
          <Files options={options} />
        </TabsContent>
        <TabsContent value="data">
          <Data />
        </TabsContent>
        <TabsContent value="events">
          <Events />
        </TabsContent>
        <TabsContent value="logs">
          <Logs />
        </TabsContent>
        <TabsContent value="appearance">
          <Appearance />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default System;
