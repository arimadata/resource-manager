# 📦️ Resource Manager

<p>
A React resource manager with event-driven architecture and keyboard shortcuts. Designed to resemble Dropbox, it provides a complete interface for managing files and folders with built-in hooks for database persistence.
</p>

## ✨ Features

- **Event-Driven Architecture**: Clean separation between UI and business logic with an event broker system
- **Database Integration**: Built-in hooks for persisting changes with optional UI locking during API calls
- **Keyboard Shortcuts**: Full keyboard navigation and shortcuts for all operations
- **Dropbox-Like Interface**: Familiar file management experience with breadcrumbs, context menus, and drag-drop
- **Resource Management**: Handle files, folders, and custom resources with flexible data structures
- **Multi-Selection**: Select multiple items with Ctrl+Click and Shift+Click for bulk operations
- **Context Menus**: Right-click context menus with customizable actions
- **Inline Editing**: Rename files and create folders with inline editing
- **Customizable & Sortable Headers**: Add column headers (e.g., Description, Last Modified, Owner) with full rendering and sorting control
- **Customizable Toolbar**: Extend existing toolbar with custom features (e.g Search)

## 🚀 Installation

```bash
npm i @arimadata/resource-manager
```

## 💻 Basic Usage

```jsx
import { useState } from "react";
import { ResourceManager } from "@arimadata/resource-manager";

const headers = [
  {
    columnName: 'Model Name',
    getValue: (item) => item.name || 'None',
    isNameColumn: true,
  },

  {
    columnName: 'Description',
    getValue: (item) => {
      const description =
        item.itemType === 'folder' ? '--' : item.resource?.description;
      return description || 'None';
    },
  },
  {
    columnName: 'Last Modified',
    getValue: (item) => {
      const updatedAt =
        item.itemType === 'folder'
          ? new Date(item.updatedAt).toLocaleString('en-US')
          : new Date(item.resource?.updatedAt).toLocaleString('en-US');
      return updatedAt || 'Unknown';
    },
    sortAccessor: (v) => new Date(v).getTime(),
  },
  {
    columnName: 'Owner',
    getValue: (item) => {
      const pk =
        item.itemType === 'folder' ? item.scopePk : item.resource?.userPk;
      return pk || 'None';
    },
  },
];

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState([
    {
      pk: "1",
      name: "Documents",
      itemType: "folder",
      iconName: "BsFolderFill",
      parentPk: null,
      updatedAt: "2025-09-04T15:38:24.358281Z",
    },
    {
      pk: "2",
      name: "Main Report",
      itemType: "resource",
      iconName: "BsFileEarmarkFill"
      scopePk: 'test@gmail.com'
      parentPk: "1",
      updatedAt: "2025-09-04T15:38:24.358281Z",
      resourceType: "report",
      resource: {
        createdAt: "2025-09-04T15:39:24.358281Z",
        updatedAt: "2025-09-04T15:38:24.358281Z",
        description: "Test Description",
        name: "Main Report",
        pk: "6250780034072576",
        userPk: "test@gmail.com",
        tabs: [],
      },
    },
  ]);

const handleCreateFolder = (data, lock) => {
    // Optional: Lock UI during API call
    const release = lock();

    createFolderAPI(data)
      .then((newFolder) => {
        setIsLoading(true)
        setItems((prev) => [...prev, { ...newFolder, iconName: "BsFolderFill" }]);
      })
      .finally(() => {
        release(); // Unlock UI
        setIsLoading(false)
      });
  };

  return (
    <ResourceManager
      isLoading={isLoading}
      headers={headers}
      items={items}
      onCreateFolder={handleCreateFolder}
      onDelete={(items, lock) => {
        /* Handle delete */
      }}
      onRename={(item, lock) => {
        /* Handle rename */
      }}
      // ... other handlers
    />
  );
}
```

## 📂 Data Structure

- Each item in the `items` array follows this structure:

```typescript
interface ResourceManagerItem<T extends object = object> {
  pk: string; // Primary key
  name: string; // Display name
  itemType: "folder" | "resource"; // Type
  iconName: string; // Icon name
  isFavorited?: boolean; // Favorite status
  scope: string; // External resource reference
  scopePk: string; // External resource reference
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  resource?: T; // External resource reference
  resourcePk?: string; // External resource reference
  resourceType: "mmm" | "report" | "audience"; // Type of resource
  parentPk?: string; // Parent item key (null for root)

  // Auto-computed fields (added by ResourceManager)
  isDirectory: boolean; // Computed from itemType
  path: string[]; // Computed path array
  isEditing: boolean; // Edit state
  isTemporary: boolean; // Temporary state
}
```

- Each header in the `headers` array follows this structure:

```typescript
interface ResourceManagerHeader<T extends object> {
  columnName: string; // Column name
  getValue: (item: ResourceManagerItem<T>) => any; // Getter function to extract the value for this column from a resource/folder item
  sortAccessor?: (value: any) => any; // Accessor for sorting purposes
  isNameColumn?: boolean; // Mark this column as name column. Used for favorite button, icons and select checkbox placement
}
```

## ⚙️ Event Handlers

All event handlers receive data and an optional `lock` function for UI control.

| Handler          | Parameters         | Description                                     |
| ---------------- | ------------------ | ----------------------------------------------- |
| `onPageChange`   | `(page)`           | Called when the current page changes            |
| `onCreateFolder` | `(data, lock)`     | Called when creating a new folder               |
| `onCreateItem`   | `(data, release)`  | Called when creating custom items (modal event) |
| `onOpen`         | `(data, lock)`     | Called when opening item                        |
| `onDelete`       | `(items, lock)`    | Called when deleting items (modal event)        |
| `onRename`       | `(item, lock)`     | Called when renaming an item                    |
| `onCopy`         | `(items, lock)`    | Called when copying items                       |
| `onCut`          | `(items, lock)`    | Called when cutting items                       |
| `onPaste`        | `(data, lock)`     | Called when pasting items                       |
| `onDuplicate`    | `(data, lock)`     | Called when duplicating items                   |
| `onFavorite`     | `(item, lock)`     | Called when toggling favorites                  |
| `onRefresh`      | `(data, lock)`     | Called when refreshing                          |
| `onSelect`       | `(items, lock)`    | Called when selection changes                   |
| `onShare`        | `(items, release)` | Called when sharing items (modal event)         |
| `onPathChange`   | `(path)`           | Called on path change                           |

### Lock/Release Pattern

You can optionally lock the resource manager (UI) if you need to prevent user interaction during async operations or to ensure order of operations.

```jsx
const onDelete = (items, lock) => {
  // Optional: Lock UI during operation
  const release = lock();

  deleteAPI(items)
    .then(() => {
      // Update your state
      getItems();
    })
    .finally(() => {
      release(); // Always unlock UI if locked
    });
};
```

### Modal Events

Some events like `onCreateItem` and `onShare` are modal events that require a different pattern:

```jsx
const onCreateItem = (data, release) => {
  console.log("onCreateItem -> data:", data);
  // 1. Setup modal handlers as needed with API calls if necessary
  // Make sure they call "release" when done
  const onConfirm = async (formData) => {
    await createItemAPI(formData);
    getItems();
    release();
  };
  const onCancel = () => {
    release();
  };

  // 2. Open the dialog
  setModal({
    open: true,
    Component: CreateModal,
    data,
    onConfirm,
    onCancel,
  });

  // 3. Tell the package how to close your dialog
  // Calling "release" will call this callback and unlock the package
  return () => {
    setModal(closedModal);
  };
};
```

## ⌨️ Keyboard Shortcuts

| Action             | Shortcut        |
| ------------------ | --------------- |
| New Folder         | `Alt + N`       |
| Cut                | `Ctrl + X`      |
| Copy               | `Ctrl + C`      |
| Paste              | `Ctrl + V`      |
| Duplicate          | `Ctrl + D`      |
| Rename             | `F2`            |
| Delete             | `Del`           |
| Select All         | `Ctrl + A`      |
| Multi-select       | `Ctrl + Click`  |
| Range Select       | `Shift + Click` |
| Range Expand       | `Shift + ↑/↓`   |
| Navigate Up/Down   | `↑/↓` arrows    |
| Jump to First/Last | `Home/End`      |
| Refresh            | `F5`            |
| Clear Selection    | `Esc`           |

## 🎨 Props

| Prop                        | Type                         | Description                                                      |
| --------------------------- | ---------------------------- | ---------------------------------------------------------------- |
| `items`                     | `ResourceManagerItem<T>[]`   | Array of items to display                                        |
| `headers`                   | `ResourceManagerHeader<T>[]` | Column definitions                                               |
| `isLoading`                 | `boolean`                    | Loading state indicator                                          |
| `page`                      | `number`                     | Current page (1‑based, optional; internal state used if omitted) |
| `pageSize`                  | `number`                     | Items per page                                                   |
| `onPageChange`              | `(page: number) => void`     | Called when the page changes                                     |
| `allowCreateFolder`         | `boolean`                    | Enable folder creation (default: `true`)                         |
| `allowCreateItem`           | `boolean`                    | Enable custom item creation (default: `true`)                    |
| `allowRefresh`              | `boolean`                    | Enable refresh (default: `true`)                                 |
| `allowShareItem`            | `boolean`                    | Enable sharing (default: `true`)                                 |
| `allowCut`                  | `boolean`                    | Enable cutting (default: `true`)                                 |
| `allowCopy`                 | `boolean`                    | Enable copying (default: `true`)                                 |
| `allowFavorite`             | `boolean`                    | Enable favorites (default: `true`)                               |
| `allowOpen`                 | `boolean`                    | Enable open action (default: `true`)                             |
| `allowPaste`                | `boolean`                    | Enable pasting (default: `true`)                                 |
| `allowRename`               | `boolean`                    | Enable renaming (default: `true`)                                |
| `allowDelete`               | `boolean`                    | Enable deletion (default: `true`)                                |
| `allowDuplicate`            | `boolean`                    | Enable duplicate (default: `false`)                              |
| `allowPagination`           | `boolean`                    | Enable internal pagination controls (default: `true`)            |
| `initialPath`               | `string[] \| null`           | Initial path segments (array of IDs/PKs) or `null` (optional)    |
| `customEmptySelectCtxItems` | `ContextMenuItem<T>[]`       | Extra context‑menu items when nothing is selected                |
| `customSelectCtxItems`      | `ContextMenuItem<T>[]`       | Extra context‑menu items when one or more items are selected     |
| `renderCustomToolbar`       | `ReactNode`                  | Custom toolbar content rendered to the right of default actions  |
| `height`                    | `string \| number`           | Component height (default: `"100%"`)                             |
| `width`                     | `string \| number`           | Component width (default: `"100%"`)                              |
| `primaryColor`              | `string`                     | Primary theme color (default: `"#6155b4"`)                       |
| `fontFamily`                | `string`                     | Font family (default: `"Rubik, sans-serif"`)                     |

## 🎛️ Customization

### Custom Headers

Define custom column headers to display different data fields:

```jsx
const headers = [
  {
    columnName: "Model Name",
    getValue: (item) => item.name || "None",
    isNameColumn: true, // This column will show icons, checkboxes, and favorite buttons
  },
  {
    columnName: "Description",
    getValue: (item) => {
      const description =
        item.itemType === "folder" ? "--" : item.resource?.description;
      return description || "None";
    },
  },
  {
    columnName: "Last Modified",
    getValue: (item) => {
      const updatedAt =
        item.itemType === "folder"
          ? new Date(item.updatedAt).toLocaleString("en-US")
          : new Date(item.resource?.updatedAt).toLocaleString("en-US");
      return updatedAt || "Unknown";
    },
    sortAccessor: (v) => new Date(v).getTime(), // Custom sorting logic
  },
];

<ResourceManager headers={headers} /* ... other props */ />;
```

**Header Properties:**

- `columnName`: Display name for the column header
- `getValue`: Function that extracts the display value from an item
- `isNameColumn`: Boolean to mark this column as the main name column (shows icons, checkboxes, favorites)
- `sortAccessor`: Optional function to transform values for sorting purposes

### Custom Toolbar

Add custom elements to the toolbar area:

```jsx
const customToolbar = (
  <>
    <input type="text" placeholder="Type to search..." />
    <button onClick={() => console.log("Searching...")}>Search</button>
  </>
);

<ResourceManager
  renderCustomToolbar={customToolbar}
  // ... other props
/>;
```

The custom toolbar content will be rendered alongside the default toolbar buttons.

### Custom Context Menu Items

Add custom right-click context menu items for both empty space and selected items:

```jsx
const customSelectCtxItems = [
  {
    title: "Dev Tools",
    icon: "BsTools",
    divider: false,
    hidden: (item) => item?.itemType === "folder", // Action is hidden on folders
    children: [
      {
        title: "Make Dev Copy",
        icon: "BsBasket",
        onClick: (item) => console.log("Make Dev Copy", item),
        hidden: false,
      },
      {
        title: "Favorited Only",
        icon: "BsBullseye",
        onClick: (item) => console.log("Favorited Item", item),
        hidden: (item) => !item?.isFavorited, // Action can be performed on non-favorited items
      },
    ],
  },
  {
    title: "Build MMM",
    icon: "BsBuilding",
    onClick: (item) => console.log("Build MMM", item),
    hidden: (item) => item?.itemType === "folder", // Action is hidden on folders
    divider: true,
  },
];

<ResourceManager
  customSelectCtxItems={customSelectCtxItems}
  customEmptySelectCtxItems={customEmptyItems}
  // ... other props
/>;
```

**Attributes:**

- `title`: Display text
- `icon`: Icon name (string) or React component
- `onClick`: Callback function receiving the context item
- `hidden`: Boolean or function to conditionally hide items
- `children`: Array of sub-menu items
- `divider`: Add separator after item

## 🏗️ Architecture

The ResourceManager uses an event-driven architecture with:

- **Event Broker**: Manages state transitions and prevents conflicting operations
- **Context Providers**: Handle selection, navigation, clipboard, and items state
- **Keyboard Integration**: Global keyboard shortcuts with conflict prevention
- **Lock System**: Optional UI locking during async operations

### Development Setup

**Frontend**

```bash
cd frontend
npm i
npm run dev
```

**Backend** (Example implementation)

```bash
python app.py
```

The example backend uses MongoDB for persistence. See `backend/.env.example` for configuration.

## 📋 TODO

### Known Issues & Improvements

- **Implement virtualized list lib to optimize large amounts of items**: For better optimization of large datasets recommended to use virtualized list libs e.g. `react-window`, `react-virtualized`

- **Folder Deletion Behavior**: When deleting a folder, all child items become root-level items, which can lead to duplicate file names. Functionally okay, but may not be intended behavior.

- **Browser Navigation**: Allow users to go "back" using browser back button or mouse back button for better navigation experience.
