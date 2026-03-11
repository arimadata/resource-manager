import type { CSSProperties, ReactElement, ReactNode } from "react";

export interface ResourceManagerHeader<T extends object> {
  columnName: string;
  getValue: (item: ResourceManagerItem<T>) => string;
  getStyle?: (item: ResourceManagerItem<T>) => CSSProperties;
  sortAccessor?: (value: string | number) => string | number;
  isNameColumn?: boolean;
}

export interface ResourceManagerItem<T extends object = object> {
  pk: string;
  name: string;
  itemType: "folder" | "resource";
  iconName: string;
  isFavorited: boolean;
  scope: string;
  scopePk: string;
  createdAt: string;
  updatedAt: string;
  resource?: T;
  resourcePk?: string;
  resourceType: "mmm" | "report" | "audience";
  parentPk?: string | null;
  path?: string[];
  isEditing?: boolean;
  isTemporary?: boolean;
  isDirectory?: boolean;
}

export interface ResourceManagerPasteData<T extends object = object> {
  copiedItems: ResourceManagerItem<T>[];
  destinationFolder: ResourceManagerItem;
  operationType: "move" | "copy";
}

export interface ContextMenuItem<T extends object> {
  title: string;
  icon: string;
  onClick?: (items: ResourceManagerItem<T>) => void;
  divider?: boolean;
  hidden?: boolean | ((item: ResourceManagerItem<T>) => boolean);
  className?: string;
  children?: Omit<ContextMenuItem<T>, "children">[];
}

export interface ResourceManagerProps<T extends object> {
  headers: ResourceManagerHeader<T>[];
  items: ResourceManagerItem<T>[];
  isLoading?: boolean;
  onCreateFolder?: (
    data: ResourceManagerItem<T>,
    lock: () => () => void
  ) => void;
  onCreateItem?: (data: null, release: () => void) => void;
  onRename?: (data: ResourceManagerItem<T>, lock: () => () => void) => void;
  onDelete?: (data: ResourceManagerItem<T>[], lock: () => () => void) => void;
  onDuplicate?: (
    data: ResourceManagerItem<T>[],
    lock: () => () => void
  ) => void;
  onCut?: (data: ResourceManagerItem<T>[], lock: () => () => void) => void;
  onCopy?: (data: ResourceManagerItem<T>[], lock: () => () => void) => void;
  onPaste?: (data: ResourceManagerPasteData<T>, lock: () => () => void) => void;
  onShare?: (data: ResourceManagerItem<T>[], release: () => void) => void;
  onFavorite?: (data: ResourceManagerItem<T>, lock: () => () => void) => void;
  onPathChange?: (path: string[]) => void;
  onRefresh?: (data: null, lock: () => () => void) => void;
  onSelect?: (data: ResourceManagerItem<T>[], lock: () => () => void) => void;
  onOpen?: (data: ResourceManagerItem<T>, lock: () => () => void) => void;
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
  createItemLabel?: string;
  initialPath?: string | null;
  customEmptySelectCtxItems?: ContextMenuItem<T>[];
  customSelectCtxItems?: ContextMenuItem<T>[];
  renderCustomToolbar?: ReactNode;
  height?: string | number;
  width?: string | number;
  primaryColor?: string;
  fontFamily?: string;
}

export declare const ResourceManager: <T extends object>(
  props: ResourceManagerProps<T>
) => ReactElement;
