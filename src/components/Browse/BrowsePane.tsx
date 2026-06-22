import { type BrowseInfo, type TreeNode } from './browseTypes';
import PlaceholderSegment from '../Shared/PlaceholderSegment';
import { Card, CardContent, CardHeader } from '../ui/card';
import Directory from './Directory';
import DirectoryTree from './DirectoryTree';
import { Circle, Loader2 } from 'lucide-react';

const BrowsePane = ({
  browseError,
  browseStatus,
  info,
  onSelectDirectory,
  pending,
  selectedDirectory,
  separator,
  tree,
  username,
}: {
  readonly browseError: unknown;
  readonly browseStatus: number;
  readonly info: BrowseInfo;
  readonly onSelectDirectory: (dir: TreeNode | null) => void;
  readonly pending: boolean;
  readonly selectedDirectory: TreeNode | null;
  readonly separator: string;
  readonly tree: TreeNode[];
  readonly username: string;
}) => {
  if (pending) {
    return (
      <div className="search-loader flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Downloaded {Math.round(browseStatus)}% of Response</span>
      </div>
    );
  }

  if (browseError) {
    return (
      <span className="browse-error">Failed to browse {username}</span>
    );
  }

  const files = (selectedDirectory?.files ?? []).map((f) => ({
    ...f,
    filename: `${selectedDirectory?.name}${separator}${f.filename}`,
  }));

  const emptyTree = tree.length === 0;

  return (
    <div className="browse-container gap-2 flex flex-col">
      {emptyTree ? (
        <PlaceholderSegment
          caption="User is not sharing any files"
          icon="folder open"
        />
      ) : (
        <Card className="browse-tree-card">
          <CardHeader className="flex items-center">
            <Circle className="h-3 w-3 text-green-500" />
            {username}
          </CardHeader>
          <CardContent>
            <p className="browse-meta">
              {`${info.files + info.lockedFiles} files in ${info.directories + info.lockedDirectories} directories (including ${info.lockedFiles} files in ${info.lockedDirectories} locked directories)`}
            </p>
            <DirectoryTree
              onSelect={(_, value) =>
                onSelectDirectory({ ...value, children: [] })
              }
              selectedDirectoryName={selectedDirectory?.name}
              tree={tree}
            />
          </CardContent>
        </Card>
      )}
      {selectedDirectory?.name && (
        <Directory
          files={files}
          locked={selectedDirectory.locked}
          marginTop={-20}
          name={selectedDirectory.name}
          onClose={() => onSelectDirectory(null)}
          username={username}
        />
      )}
    </div>
  );
};

export default BrowsePane;
