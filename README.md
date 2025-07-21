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

## 🚀 Installation

```bash
npm i @arimadata/resource-manager
```

## 💻 Basic Usage

```jsx
import { useState } from "react";
import { ResourceManager } from "@arimadata/resource-manager";

function App() {
  const [items, setItems] = useState([
    {
      pk: "1",
      displayName: "Documents",
      itemType: "folder",
      parentPk: null,
      updatedAt: "2024-09-09T10:30:00Z",
    },
    {
      pk: "2",
      displayName: "Main Report",
      itemType: "resource",
      parentPk: "1",
      updatedAt: "2024-09-08T16:45:00Z",
      resourceType: "reports",
    },
  ]);

  const handleCreateFolder = (data, lock) => {
    // Optional: Lock UI during API call
    const release = lock();

    createFolderAPI(data)
      .then((newFolder) => {
        setItems((prev) => [...prev, newFolder]);
      })
      .finally(() => {
        release(); // Unlock UI
      });
  };

  return (
    <ResourceManager
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

Each item in the `items` array follows this structure:

```typescript
type Item = {
  pk: string; // Primary key (required)
  displayName: string; // Display name (required)
  itemType: "folder" | "resource"; // Type (required)
  parentPk?: string; // Parent item key (null for root)
  iconName?: string; // Optional icon name
  isFavorited?: boolean; // Favorite status
  updatedAt?: string; // ISO 8601 timestamp
  resourceType: "mmm" | "report" | "audience"; // Type of resource
  resourcePk?: string; // External resource reference

  // Auto-computed fields (added by ResourceManager)
  isDirectory: boolean; // Computed from itemType
  path: string[]; // Computed path array
  isEditing: boolean; // Edit state
};
```

## ⚙️ Event Handlers

All event handlers receive data and an optional `lock` function for UI control:

| Handler          | Parameters         | Description                                     |
| ---------------- | ------------------ | ----------------------------------------------- |
| `onCreateFolder` | `(data, lock)`     | Called when creating a new folder               |
| `onCreateItem`   | `(data, release)`  | Called when creating custom items (modal event) |
| `onDelete`       | `(items, lock)`    | Called when deleting items                      |
| `onRename`       | `(item, lock)`     | Called when renaming an item                    |
| `onCopy`         | `(items, lock)`    | Called when copying items                       |
| `onCut`          | `(items, lock)`    | Called when cutting items                       |
| `onPaste`        | `(data, lock)`     | Called when pasting items                       |
| `onFavorite`     | `(item, lock)`     | Called when toggling favorites                  |
| `onRefresh`      | `(data, lock)`     | Called when refreshing                          |
| `onSelect`       | `(items, lock)`    | Called when selection changes                   |
| `onShare`        | `(items, release)` | Called when sharing items (modal event)         |

### Lock/Release Pattern

```jsx
const handleOperation = (data, lock) => {
  // Option 1: No locking (default)
  performOperation(data);

  // Option 2: Lock UI during async operation
  const release = lock();
  performAsyncOperation(data)
    .then((result) => {
      // Update your state
      setItems(result);
    })
    .finally(() => {
      release(); // Always release the lock
    });
};
```

### Modal Events

Some events like `onCreateItem` and `onShare` are modal events that require a different pattern:

```jsx
const handleCreateItem = (data, release) => {
  // Show your modal
  setShowModal(true);

  const handleConfirm = async (formData) => {
    await createItemAPI(formData);
    setItems((prev) => [...prev, newItem]);
    release(); // Close modal and unlock
  };

  // Return cleanup function (called on ESC or cancel)
  return () => {
    setShowModal(false);
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

| Prop                | Type               | Description                                        |
| ------------------- | ------------------ | -------------------------------------------------- |
| `items`             | `Item[]`           | Array of items to display                          |
| `isLoading`         | `boolean`          | Loading state indicator                            |
| `allowCreateFolder` | `boolean`          | Enable folder creation (default: `true`)           |
| `allowCreateItem`   | `boolean`          | Enable custom item creation (default: `true`)      |
| `allowDelete`       | `boolean`          | Enable deletion (default: `true`)                  |
| `allowRename`       | `boolean`          | Enable renaming (default: `true`)                  |
| `allowCopy`         | `boolean`          | Enable copying (default: `true`)                   |
| `allowCut`          | `boolean`          | Enable cutting (default: `true`)                   |
| `allowPaste`        | `boolean`          | Enable pasting (default: `true`)                   |
| `allowFavorite`     | `boolean`          | Enable favorites (default: `true`)                 |
| `allowShareItem`    | `boolean`          | Enable sharing (default: `true`)                   |
| `initialPath`       | `string[]`         | Initial navigation path                            |
| `height`            | `string \| number` | Component height (default: `"100%"`)               |
| `width`             | `string \| number` | Component width (default: `"100%"`)                |
| `primaryColor`      | `string`           | Primary theme color (default: `"#6155b4"`)         |
| `fontFamily`        | `string`           | Font family (default: `"Nunito Sans, sans-serif"`) |

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
