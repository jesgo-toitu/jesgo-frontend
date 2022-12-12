import React from 'react';
import TreeItem, {
  TreeItemProps,
  TreeItemContentProps,
  useTreeItem,
} from '@mui/lab/TreeItem';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';

const CustomContent = React.forwardRef((props: TreeItemContentProps, ref) => {
  const {
    classes,
    className,
    label,
    nodeId,
    icon: iconProp,
    expansionIcon,
    displayIcon,
    onClick: onClickEvent,
  } = props;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId);

  const icon = iconProp || expansionIcon || displayIcon;

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    preventSelection(event);
  };

  const handleExpansionClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    handleExpansion(event);
  };

  const handleSelectionClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    handleSelection(event);
    // 独自のonClickEvent実行
    if (onClickEvent) {
      onClickEvent(event);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref as React.Ref<HTMLDivElement>}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div onClick={handleExpansionClick} className={classes.iconContainer}>
        {icon}
      </div>
      <Typography
        onClick={handleSelectionClick}
        component="div"
        className={classes.label}
      >
        {label}
      </Typography>
    </div>
  );
});

/**
 * CustomTreeItem (labelクリックでのツリー展開抑止)
 * @param treeProps
 * @returns
 */
const CustomTreeItem = (treeProps: TreeItemProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <TreeItem ContentComponent={CustomContent} {...treeProps} />
);

export default CustomTreeItem;
