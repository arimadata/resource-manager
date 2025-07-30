import { useEffect, useRef, useState } from "react";
import ResourceManager from "./ResourceManager/ResourceManager";
import { renameAPI } from "./api/renameAPI";
import { deleteAPI } from "./api/deleteAPI";
import { copyItemAPI, moveItemAPI } from "./api/itemTransferAPI";
import { getAllItemsAPI } from "./api/getAllItemsAPI";
import { createItemAPI } from "./api/createItemAPI";
import { favoriteAPI } from "./api/favoriteAPI";
import "./App.scss";
import { CreateModal } from "./exampleModals/CreateModal";

const closedModal = {
  open: false,
  Component: null,
  data: null,
  onConfirm: null,
  onCancel: null,
};

function App() {
  const [loadingCount, setLoadingCount] = useState(0);
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(closedModal);
  const isMountRef = useRef(false);

  const incrementLoadingCount = () => {
    setLoadingCount((prev) => prev + 1);
  };
  const decrementLoadingCount = () => {
    setLoadingCount((prev) => prev - 1);
  };
  const isLoading = loadingCount > 0;

  ////////////////////////////////////////////////////
  const onCreateItem = (data, release) => {
    console.log("onCreateItem -> data:", data);
    // 1. Setup modal handlers as needed with API calls if necessary
    // Make sure they call "release" when done
    const onConfirm = async (formData) => {
      // await createItemAPI(formData);
      // getItems();
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

  const onShare = (data, release) => {
    console.log("onShare -> data:", data);
    // 1. Setup modal handlers as needed with API calls if necessary
    // Make sure they call "release" when done
    const onConfirm = async (values) => {
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
  ////////////////////////////////////////////////////

  const getItems = async () => {
    try {
      const response = await getAllItemsAPI();
      setItems(response.data.data);
    } catch (error) {
      console.error("Error getting items:", error);
    }
  };

  useEffect(() => {
    if (isMountRef.current) return;
    isMountRef.current = true;
    incrementLoadingCount();
    getItems();
    decrementLoadingCount();
  }, []);

  const onDelete = (data, lock) => {
    console.log("onDelete -> data:", data);
    // // Optional: Lock the UI until all deletes are completed
    // const release = lock();
    // incrementLoadingCount();
    const deletePromises = data.map((item) => deleteAPI(item));
    Promise.all(deletePromises)
      .then((responses) => {
        if (responses.every((response) => response.status === 200)) {
          // Optional: Refresh the items list
          getItems();
        } else {
          console.error(responses);
        }
      })
      .catch((error) => {
        console.error("Error deleting items:", error);
      })
      .finally(() => {
        // // Optional: Unlock the UI if locked
        // decrementLoadingCount();
        // release();
      });
  };

  const onCopy = (data, lock) => {
    console.log("onCopy -> data:", data);
  };

  const onCreateFolder = (data, lock) => {
    console.log("onCreateFolder -> data:", data);
    // // Optional: Lock the UI until the folder is created
    // const release = lock();
    // incrementLoadingCount();

    createItemAPI(data)
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          // Option 1: Insert new item individually
          setItems((prev) => {
            // Remove the UI generated skeleton item and add the new item
            const items = prev.filter((item) => item.pk !== data.pk);
            return [...items, response.data];
          });
          // Option 2: Refresh the items list
          // getItems();
        } else {
          console.error(response);
        }
      })
      .catch((error) => {
        console.error("Error creating folder:", error);
      })
      .finally(() => {
        // // Optional: Unlock the UI if locked
        // decrementLoadingCount();
        // release();
      });
  };

  const onCut = (data, release) => {
    console.log("onCut -> data:", data);
  };

  const onFavorite = (data, lock) => {
    console.log("onFavorite -> data:", data);
    // // Optional: Lock the UI until the favorite is updated
    // const release = lock();
    // incrementLoadingCount();

    favoriteAPI(data)
      .then((response) => {
        console.log("Favorite updated:", response);
      })
      .catch((error) => {
        console.error("Error updating favorite:", error);
      })
      .finally(() => {
        // // Optional: Unlock the UI if locked
        // decrementLoadingCount();
        // release();
      });
  };

  const onOpen = (data, lock) => {
    console.log("onOpen -> data:", data);
  };

  const onPaste = (data, lock) => {
    console.log("onPaste -> data:", data);
    // Optional: Lock the UI until the paste is completed
    const release = lock();
    incrementLoadingCount();
    // operationType: "copy" or "move"
    const { copiedItems, destinationFolder, operationType } = data;
    const pastePromise =
      operationType === "copy"
        ? copyItemAPI(copiedItems, destinationFolder?.pk || null)
        : moveItemAPI(copiedItems, destinationFolder?.pk || null);
    pastePromise
      .then((response) => {
        // Optional: Refresh the items list
        return getItems();
      })
      .catch((error) => {
        console.error("Error during paste operation:", error);
      })
      .finally(() => {
        // Optional: Unlock the UI if locked
        decrementLoadingCount();
        release();
      });
  };

  const onRefresh = (data, lock) => {
    // // Optional: Lock the UI until the refresh is completed
    // const release = lock();
    // incrementLoadingCount();
    console.log("onRefresh -> data:", data);
    getItems()
      .then(() => {
        console.log("Refresh completed");
      })
      .catch((error) => {
        console.error("Error refreshing items:", error);
      })
      .finally(() => {
        // // Optional: Unlock the UI if locked
        // decrementLoadingCount();
        // release();
      });
  };

  const onRename = (data, lock) => {
    console.log("onRename -> data:", data);
    // // Optional: Lock the UI until the rename is completed
    // const release = lock();
    // incrementLoadingCount();
    renameAPI(data)
      .then((response) => {
        if (response.status === 200) {
          // Optional: Refresh the items list
          getItems();
        } else {
          console.error(response);
        }
      })
      .catch((error) => {
        console.error("Error renaming item:", error);
      })
      .finally(() => {
        // // Optional: Unlock the UI if locked
        // decrementLoadingCount();
        // release();
      });
  };

  const onSelect = (data, lock) => {
    console.log("onSelect -> data:", data);
  };

  ////////////////////////////////////////////////////
  // Context Menu

  const customEmptySelecCtxItems = [];
  const customSelecCtxItems = [];

  /////////////////////////////////////////////////////////////////
  // Uncomment below to see how to add custom context menu items //
  /////////////////////////////////////////////////////////////////

  // const customEmptySelecCtxItems = [
  //   {
  //     title: "custom Item 1",
  //     icon: "FaChurch",
  //     children: [
  //       {
  //         title: "custom sub Item 1",
  //         icon: "FaBaby",
  //         onClick: (allItems) => console.log("custom sub Item 1", allItems),
  //       },
  //       {
  //         title: "sub Item 2",
  //         icon: "FaBaby",
  //         onClick: (allItems) => console.log("custom sub Item 2", allItems),
  //       },
  //     ],
  //   },
  //   {
  //     title: "custom sub Item 1",
  //     icon: "FaBaby",
  //     onClick: (allItems) => console.log("custom Item 2", allItems),
  //     divider: true,
  //   },
  // ];
  // const customSelecCtxItems = [
  //   {
  //     title: "Dev Tools",
  //     icon: "FaBaby",
  //     divider: false,
  //     hidden: (item) => item?.itemType === "folder", // Action is hidden on folders
  //     children: [
  //       {
  //         title: "Make Dev Copy",
  //         icon: "FaChurch",
  //         onClick: (item) => console.log("Make Dev Copy", item),
  //         hidden: false,
  //       },
  //       {
  //         title: "Favorited Only",
  //         icon: "FaCaretDown",
  //         onClick: (item) => console.log("Favorited Item", item),
  //         hidden: (item) => !item?.isFavorited, // Action can be performed on non-favorited items
  //       },
  //     ],
  //   },
  //   {
  //     title: "Build MMM",
  //     icon: "FaAccessibleIcon",
  //     onClick: (item) => console.log("Build MMM", item),
  //     hidden: (item) => item?.itemType === "folder", // Action is hidden on folders
  //     divider: true,
  //   },
  // ];

  return (
    <div className="app">
      <div className="file-manager-container">
        <ResourceManager
          items={items}
          isLoading={isLoading}
          onCopy={onCopy}
          onCreateFolder={onCreateFolder}
          onCreateItem={onCreateItem}
          onCut={onCut}
          onDelete={onDelete}
          onFavorite={onFavorite}
          onOpen={onOpen}
          onPaste={onPaste}
          onRefresh={onRefresh}
          onRename={onRename}
          onSelect={onSelect}
          onShare={onShare}
          initialPath={null}
          customEmptySelecCtxItems={customEmptySelecCtxItems}
          customSelecCtxItems={customSelecCtxItems}
          height="100%"
          width="100%"
          fontFamily="Nunito Sans, sans-serif"
          primaryColor="#6155b4"
        />
      </div>
      {modal.open && (
        <modal.Component
          data={modal.data}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
        />
      )}
    </div>
  );
}

export default App;
