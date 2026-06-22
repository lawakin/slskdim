import './Files.css';
import Explorer from './Explorer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type ApplicationOptions } from '@/types';
import React from 'react';
// import { Tab } from 'semantic-ui-react';

const Files = ({ options }: { readonly options: ApplicationOptions }) => {
  const { remoteFileManagement } = options;

  return (
    <div>
      {/* <Tab panes={panes} /> */}
      <Tabs>
        <TabsList>
          <TabsTrigger value="downloads"> Downloads </TabsTrigger>
          <TabsTrigger value="incomplete"> Incomplete </TabsTrigger>
        </TabsList>
        <TabsContent value="downloads">
          <Explorer
            remoteFileManagement={remoteFileManagement}
            root="downloads"
          />
        </TabsContent>

        <TabsContent value="incomplete">
          <Explorer
            remoteFileManagement={remoteFileManagement}
            root="incomplete"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Files;
