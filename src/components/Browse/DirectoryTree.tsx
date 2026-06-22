import { type UserDirectory } from '../../lib/users';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Folder, FolderOpen, Lock } from 'lucide-react';
import React, { useMemo, useRef } from 'react';

type TreeNode = UserDirectory & {
  children: TreeNode[];
  locked?: boolean;
};

type ParentLine = { continues: boolean; depth: number };

type FlatNode = {
  depth: number;
  isLast: boolean;
  node: TreeNode;
  parentLines: ParentLine[];
};

const flattenTree = (roots: TreeNode[]): FlatNode[] => {
  const result: FlatNode[] = [];

  type StackItem = {
    depth: number;
    index: number;
    nodes: TreeNode[];
    parentLines: ParentLine[];
  };

  const stack: StackItem[] = [
    { depth: 0, index: 0, nodes: roots, parentLines: [] },
  ];

  while (stack.length > 0) {
    const top = stack[stack.length - 1];

    if (top.index >= top.nodes.length) {
      stack.pop();
      continue;
    }

    const n = top.nodes[top.index];
    const isLast = top.index === top.nodes.length - 1;
    result.push({ depth: top.depth, isLast, node: n, parentLines: top.parentLines });
    top.index++;

    if (n.children.length > 0) {
      stack.push({
        depth: top.depth + 1,
        index: 0,
        nodes: n.children,
        parentLines: [...top.parentLines, { continues: !isLast, depth: top.depth }],
      });
    }
  }

  return result;
};

const GUIDE_WIDTH = 16;

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
          const {
            depth: _depth,
            isLast: _isLast,
            node: d,
            parentLines,
          } = flatNodes[virtualItem.index];
          const selected = d.name === selectedDirectoryName;
          const colorClass = d.locked
            ? 'browse-folderlist-icon locked'
            : selected
              ? 'browse-folderlist-icon selected'
              : 'browse-folderlist-icon';

          return (
            <div
              className="flex items-center whitespace-nowrap"
              key={virtualItem.key}
              style={{
                height: `${virtualItem.size}px`,
                left: 0,
                position: 'absolute',
                top: 0,
                transform: `translateY(${virtualItem.start}px)`,
                width: '100%',
              }}
            >
              {/* Ancestor guide lines */}
              {parentLines.map((line) => (
                <div
                  className="relative self-stretch flex-shrink-0"
                  key={line.depth}
                  style={{ width: GUIDE_WIDTH }}
                >
                  {/* {line.continues && ( */}
                  {/*   <div */}
                  {/*     className="absolute border-l border-muted-foreground/30" */}
                  {/*     style={{ bottom: 0, left: '50%', top: 0 }} */}
                  {/*   /> */}
                  {/* )} */}
                </div>
              ))}

              {/* Connector for current depth (├── or └──) */}
              {/* {depth > 0 && ( */}
              {/*   <div */}
              {/*     className="relative self-stretch flex-shrink-0" */}
              {/*     style={{ width: GUIDE_WIDTH }} */}
              {/*   > */}
              {/* Vertical line down from top to center */}
              {/* <div */}
              {/*   className="absolute border-l border-muted-foreground/30" */}
              {/*   style={{ height: '50%', left: '50%', top: 0 }} */}
              {/* /> */}
              {/* Horizontal line from center to right */}
              {/* <div */}
              {/*   className="absolute border-t border-muted-foreground/30" */}
              {/*   style={{ left: '50%', right: 0, top: '50%' }} */}
              {/* /> */}
              {/* Vertical line down from center (only if not last sibling) */}
              {/*     {!isLast && ( */}
              {/*       <div */}
              {/*         className="absolute border-l border-muted-foreground/30" */}
              {/*         style={{ bottom: 0, left: '50%', top: '50%' }} */}
              {/*       /> */}
              {/*     )} */}
              {/*   </div> */}
              {/* )} */}

              <div className="flex items-center gap-1 ml-1">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DirectoryTree;
