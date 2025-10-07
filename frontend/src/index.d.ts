import type { FC, ReactNode } from "react";

export interface ResourceManagerHeader {
  columnName: string;
  getValue: (item: ResourceManagerItem) => any;
  sortAccessor?: (value: any) => any;
  isNameColumn?: boolean;
}

export interface ResourceManagerItem {
  pk: string;
  displayName: string;
  itemType: "folder" | "resource";
  iconName: string;
  isFavorited: boolean;
  scope: string;
  scopePk: string;
  createdAt: string;
  updatedAt: string;
  resource: Record<string, any> | null;
  resourcePk: string;
  resourceType: "mmm" | "report" | "audience";
  parentPk?: string | null;
  path?: string[];
  isEditing?: boolean;
  isTemporary?: boolean;
}

export interface ResourceManagerPasteData {
  copiedItems: ResourceManagerItem[];
  destinationFolder: ResourceManagerItem;
  operationType: "move" | "copy";
}

export interface ContextMenuItem {
  title: string;
  icon: string;
  onClick?: (items: ResourceManagerItem) => void;
  divider?: boolean;
  hidden?: boolean | ((item: ResourceManagerItem) => boolean);
  className?: string;
  children?: Omit<ContextMenuItem, "children">[];
}

export interface ResourceManagerProps {
  headers: ResourceManagerHeader[];
  items: ResourceManagerItem[];
  isLoading?: boolean;
  onCreateFolder?: (data: ResourceManagerItem, lock: () => () => void) => void;
  onCreateItem?: (data: null, release: () => void) => void;
  onRename?: (data: ResourceManagerItem, lock: () => () => void) => void;
  onDelete?: (data: ResourceManagerItem[], lock: () => () => void) => void;
  onDuplicate?: (data: ResourceManagerItem[], lock: () => () => void) => void;
  onCut?: (data: ResourceManagerItem[], lock: () => () => void) => void;
  onCopy?: (data: ResourceManagerItem[], lock: () => () => void) => void;
  onPaste?: (data: ResourceManagerPasteData, lock: () => () => void) => void;
  onShare?: (data: ResourceManagerItem[], release: () => void) => void;
  onFavorite?: (data: ResourceManagerItem, lock: () => () => void) => void;
  onPathChange?: (path: string[]) => void;
  onRefresh?: (data: null, lock: () => () => void) => void;
  onSelect?: (data: ResourceManagerItem[], lock: () => () => void) => void;
  onOpen?: (data: ResourceManagerItem, lock: () => () => void) => void;
  allowCreateFolder?: boolean;
  allowCreateItem?: boolean;
  allowRefresh?: boolean;
  allowShareItem?: boolean;
  allowCut?: boolean;
  allowCopy?: boolean;
  allowFavorite?: boolean;
  allowOpen?: boolean;
  allowPaste?: boolean;
  allowRename?: boolean;
  allowDelete?: boolean;
  allowDuplicate?: boolean;
  initialPath?: string | null;
  customEmptySelectCtxItems?: ContextMenuItem[];
  customSelectCtxItems?: ContextMenuItem[];
  renderCustomToolbar?: ReactNode;
  height?: string | number;
  width?: string | number;
  primaryColor?: string;
  fontFamily?: string;
}

export declare const ResourceManager: FC<ResourceManagerProps>;
