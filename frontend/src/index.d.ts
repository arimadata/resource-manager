import { FC, ReactNode } from "react";

export interface ResourceManagerHeader {
  attribute: string;
  defaultValue: string;
  columnName?: string;
  transform?: (value: any) => any;
  sortAccessor?: (value: any) => any;
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
  resource: Record<string, any>;
  resourcePk: string;
  resourceType: "mmm" | "report" | "audience";
}

export interface ResourceManagerItemData extends ResourceManagerItem {
  parentPk: string | null;
  path: string[];
  isEditing: boolean;
  isTemporary: boolean;
}

export interface ResourceManagerPasteData {
  copiedItems: ResourceManagerItemData[];
  destinationFolder: ResourceManagerItemData;
  operationType: "move" | "copy";
}

export interface ContextMenuItem {
  title: string;
  icon: string | ReactNode;
  onClick: () => void;
  divider?: boolean;
  hidden?: boolean | ((item: ResourceManagerItem) => boolean);
  className?: string;
  children?: Omit<ContextMenuItem, "children">[];
}

export interface ResourceManagerProps {
  headers: ResourceManagerHeader[];
  items: ResourceManagerItem[];
  isLoading?: boolean;
  onCreateFolder?: (
    data: ResourceManagerItemData,
    lock: () => () => void
  ) => void;
  onCreateItem?: (data: ResourceManagerItemData, release: () => void) => void;
  onRename?: (data: ResourceManagerItemData, lock: () => () => void) => void;
  onDelete?: (data: ResourceManagerItemData[], lock: () => () => void) => void;
  onCut?: (data: ResourceManagerItemData[], lock: () => () => void) => void;
  onCopy?: (data: ResourceManagerItemData[], lock: () => () => void) => void;
  onPaste?: (data: ResourceManagerPasteData, lock: () => () => void) => void;
  onShare?: (data: ResourceManagerItemData, release: () => void) => void;
  onFavorite?: (data: ResourceManagerItemData, lock: () => () => void) => void;
  onRefresh?: (
    data: ResourceManagerItemData[] | null,
    lock: () => () => void
  ) => void;
  onSelect?: (data: ResourceManagerItemData[], lock: () => () => void) => void;
  onOpen?: (data: ResourceManagerItemData, lock: () => () => void) => void;
  allowCreateFolder?: boolean;
  allowCreateItem?: boolean;
  allowShareItem?: boolean;
  allowCut?: boolean;
  allowCopy?: boolean;
  allowFavorite?: boolean;
  allowOpen?: boolean;
  allowPaste?: boolean;
  allowRename?: boolean;
  allowDelete?: boolean;
  initialPath?: string | null;
  customEmptySelecCtxItems?: ContextMenuItem[];
  customSelecCtxItems?: ContextMenuItem[];
  height?: string | number;
  width?: string | number;
  primaryColor?: string;
  fontFamily?: string;
}

export declare const ResourceManager: FC<ResourceManagerProps>;
