import { type UserDirectory } from '../../lib/users';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Folder, FolderOpen, Lock } from 'lucide-react';
import React, { useMemo, useRef } from 'react';

type TreeNode = UserDirectory & {
  children: TreeNode[];
  locked?: boolean;
};

type FlatNode = {
  depth: number;
  node: TreeNode;
};

const flattenTree = (nodes: TreeNode[], depth = 0): FlatNode[] =>
  nodes.flatMap((n) => [
    { depth, node: n },
    ...flattenTree(n.children, depth + 1),
  ]);

const DirectoryTree = ({
  onSelect,
  selectedDirectoryName,
  tree,
}: {
  readonly onSelect: (event: React.MouseEvent, directory: TreeNode) => void;
  readonly selectedDirectoryName: string | undefined;
  readonly tree: TreeNode[];
}) => {
  const flatNodes = useMemo(() => flattenTree(tree), [tree]);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    estimateSize: () => 28,
    getScrollElement: () => parentRef.current,
    overscan: 10,
  });

  return (
    <div
      className="browse-folderlist"
      ref={parentRef}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative',
          width: '100%',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const { depth, node: d } = flatNodes[virtualItem.index];
          const selected = d.name === selectedDirectoryName;
          const colorClass = d.locked
            ? 'browse-folderlist-icon locked'
            : selected
              ? 'browse-folderlist-icon selected'
              : 'browse-folderlist-icon';

          return (
            <div
              className="flex items-center gap-1 whitespace-nowrap"
              key={virtualItem.key}
              style={{
                height: `${virtualItem.size}px`,
                left: 0,
                paddingLeft: `${depth * 16}px`,
                position: 'absolute',
                top: 0,
                transform: `translateY(${virtualItem.start}px)`,
                width: '100%',
              }}
            >
              {d.locked ? (
                <Lock className={colorClass} />
              ) : selected ? (
                <FolderOpen className={colorClass} />
              ) : (
                <Folder className={colorClass} />
              )}
              <button
                className={
                  'browse-folderlist-header' +
                  (selected ? ' selected' : '') +
                  (d.locked ? ' locked' : '')
                }
                onClick={(event) => onSelect(event, d)}
                type="button"
              >
                {d.name.split('\\').pop()?.split('/').pop()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DirectoryTree;
