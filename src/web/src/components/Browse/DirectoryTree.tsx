import { type UserDirectory } from '../../lib/users';
import { Folder, FolderOpen, Lock } from 'lucide-react';
import React from 'react';

type TreeNode = UserDirectory & {
  children: TreeNode[];
  locked?: boolean;
};

const subtree = (
  root: TreeNode[],
  selectedDirectoryName: string | undefined,
  onSelect: (event: React.MouseEvent, directory: TreeNode) => void,
): React.ReactNode[] =>
  root.map((d) => {
    const selected = d.name === selectedDirectoryName;
    const iconClass =
      'browse-folderlist-icon' +
      (selected ? ' selected' : '') +
      (d.locked ? ' locked' : '');

    return (
      <ul
        className="browse-folderlist-list"
        key={d.name}
      >
        <li className="browse-folderlist-item">
          {d.locked ? (
            <Lock className={iconClass} />
          ) : selected ? (
            <FolderOpen className={iconClass} />
          ) : (
            <Folder className={iconClass} />
          )}
          <div>
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
            <ul>{subtree(d.children, selectedDirectoryName, onSelect)}</ul>
          </div>
        </li>
      </ul>
    );
  });

const DirectoryTree = ({
  onSelect,
  selectedDirectoryName,
  tree,
}: {
  readonly onSelect: (event: React.MouseEvent, directory: TreeNode) => void;
  readonly selectedDirectoryName: string | undefined;
  readonly tree: TreeNode[];
}) => subtree(tree, selectedDirectoryName, onSelect);

export default DirectoryTree;
