import { FC, ReactNode } from "react";

export interface ResourceManagerItem {
  pk: string;
  displayName: string;
  itemType: "folder" | "resource";
  iconName?: string;
  isFavorited?: boolean;
  parentPk?: string;
  scope?: string;
  scopePk?: string;
  createdAt?: string;
  updatedAt?: string;
  resource?: object;
  resourcePk?: string;
  resourceType: "mmm" | "report" | "audience";
  isDirectory?: boolean;
  path?: string;
  isEditing?: boolean;
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
  items: ResourceManagerItem[];
  isLoading: boolean;
  onCreateFolder: (data: any, release: () => void) => void;
  onCreateItem: (data: any, release: () => void) => void;
  onRename: (data: any, release: () => void) => void;
  onDelete: (data: any, release: () => void) => void;
  onCut: (data: any, release: () => void) => void;
  onCopy: (data: any, release: () => void) => void;
  onPaste: (data: any, release: () => void) => void;
  onShare: (data: any, release: () => void) => void;
  onFavorite: (data: any, release: () => void) => void;
  onRefresh: (data: any, release: () => void) => void;
  onSelect: (data: any, release: () => void) => void;
  onOpen: (data: any, release: () => void) => void;
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
export default ResourceManager;
