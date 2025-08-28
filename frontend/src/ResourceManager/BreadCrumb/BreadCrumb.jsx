import { useCallback, useEffect, useRef, useState } from "react";
import { MdHome, MdMoreHoriz, MdOutlineNavigateNext } from "react-icons/md";
import { useNavigation } from "../../contexts/NavigationContext";
import { useItems } from "../../contexts/ItemsContext";
import { useDetectOutsideClick } from "../../hooks/useDetectOutsideClick";
import { useClipBoard } from "../../contexts/ClipboardContext";
import PropTypes from "prop-types";
import "./BreadCrumb.scss";
import Tooltip from "../../components/Tooltip/Tooltip";

const BreadCrumb = ({ eventBroker }) => {
  const [folders, setFolders] = useState([]);
  const [hiddenFolders, setHiddenFolders] = useState([]);
  const [hiddenFoldersWidth, setHiddenFoldersWidth] = useState([]);
  const [showHiddenFolders, setShowHiddenFolders] = useState(false);
  const [dragOverFolder, setDragOverFolder] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const { currentPath } = useNavigation();
  const { itemMap } = useItems();
  const { clipBoard } = useClipBoard();
  const breadCrumbRef = useRef(null);
  const foldersRef = useRef([]);
  const moreBtnRef = useRef(null);
  const popoverRef = useDetectOutsideClick(() => {
    setShowHiddenFolders(false);
  });

  useEffect(() => {
    const breadcrumbFolders = [];

    breadcrumbFolders.push({
      name: "Home",
      path: [],
    });

    for (let i = 0; i < currentPath.length; i++) {
      const itemPk = currentPath[i];
      const item = itemMap.get(itemPk);

      if (item) {
        breadcrumbFolders.push({
          name: item.displayName,
          path: currentPath.slice(0, i + 1),
        });
      }
    }

    setFolders(breadcrumbFolders);
    setHiddenFolders([]);
    setHiddenFoldersWidth([]);
  }, [currentPath, itemMap]);

  const switchPath = (path) => {
    eventBroker.publish("switchPath", path);
  };

  const handleDragEnterOver = (e, folder) => {
    e.preventDefault();

    if (!clipBoard?.isMoving) {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    e.dataTransfer.dropEffect = "copy";
    setDragOverFolder(folder);
    setTooltipPosition({ x: e.clientX + 30, y: e.clientY + 12 });
  };

  const handleDragLeave = (e, folder) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (dragOverFolder === folder) {
        setDragOverFolder(null);
        setTooltipPosition(null);
      }
    }
  };

  const handleDrop = (e, folder) => {
    e.preventDefault();

    const destinationFolder =
      folder.path.length > 0
        ? itemMap.get(folder.path[folder.path.length - 1])
        : null;

    eventBroker.publish("pasteItems", destinationFolder);
    setDragOverFolder(null);
    setTooltipPosition(null);
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      setDragOverFolder(null);
      setTooltipPosition(null);
    }, 100);
  };

  useEffect(() => {
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  const getBreadCrumbWidth = useCallback(() => {
    const containerWidth = breadCrumbRef.current.clientWidth;
    const containerStyles = getComputedStyle(breadCrumbRef.current);
    const paddingLeft = parseFloat(containerStyles.paddingLeft);
    const moreBtnGap = hiddenFolders.length > 0 ? 1 : 0;
    const flexGap =
      parseFloat(containerStyles.gap) * (folders.length + moreBtnGap);
    return containerWidth - (paddingLeft + flexGap);
  }, [folders, hiddenFolders]);

  const checkAvailableSpace = useCallback(() => {
    const availableSpace = getBreadCrumbWidth();
    const remainingFoldersWidth = foldersRef.current.reduce((prev, curr) => {
      if (!curr) return prev;
      return prev + curr.clientWidth;
    }, 0);
    const moreBtnWidth = moreBtnRef.current?.clientWidth || 0;
    return availableSpace - (remainingFoldersWidth + moreBtnWidth);
  }, [getBreadCrumbWidth]);

  const isBreadCrumbOverflowing = () => {
    return (
      breadCrumbRef.current.scrollWidth > breadCrumbRef.current.clientWidth
    );
  };

  useEffect(() => {
    if (isBreadCrumbOverflowing()) {
      const hiddenFolder = folders[1];
      const hiddenFolderWidth = foldersRef.current[1]?.clientWidth;
      setHiddenFoldersWidth((prev) => [...prev, hiddenFolderWidth]);
      setHiddenFolders((prev) => [...prev, hiddenFolder]);
      setFolders((prev) => prev.filter((_, index) => index !== 1));
    } else if (
      hiddenFolders.length > 0 &&
      checkAvailableSpace() > hiddenFoldersWidth.at(-1)
    ) {
      const newFolders = [
        folders[0],
        hiddenFolders.at(-1),
        ...folders.slice(1),
      ];
      setFolders(newFolders);
      setHiddenFolders((prev) => prev.slice(0, -1));
      setHiddenFoldersWidth((prev) => prev.slice(0, -1));
    }
  }, [folders, hiddenFolders, hiddenFoldersWidth, checkAvailableSpace]);

  return (
    <div className="bread-crumb-container">
      <div
        className="breadcrumb"
        ref={breadCrumbRef}
        onDragOver={(e) => {
          e.preventDefault();
        }}
      >
        {folders.map((folder, index) => (
          <div key={index} style={{ display: "contents" }}>
            <span
              className={`folder-name ${
                dragOverFolder === folder ? "breadcrumb-drop-zone" : ""
              }`}
              onClick={() => switchPath(folder.path)}
              ref={(el) => (foldersRef.current[index] = el)}
              onDragEnter={(e) => handleDragEnterOver(e, folder)}
              onDragOver={(e) => handleDragEnterOver(e, folder)}
              onDragLeave={(e) => handleDragLeave(e, folder)}
              onDrop={(e) => handleDrop(e, folder)}
            >
              {index === 0 ? <MdHome /> : <MdOutlineNavigateNext />}
              {folder.name}
            </span>
            {hiddenFolders?.length > 0 && index === 0 && (
              <button
                className="folder-name folder-name-btn"
                onClick={() => setShowHiddenFolders(true)}
                ref={moreBtnRef}
                title="Show more folders"
              >
                <MdMoreHoriz size={22} className="hidden-folders" />
              </button>
            )}
          </div>
        ))}
      </div>

      {showHiddenFolders && (
        <ul ref={popoverRef.ref} className="hidden-folders-container">
          {hiddenFolders.map((folder, index) => (
            <li
              key={index}
              className={
                dragOverFolder === folder ? "breadcrumb-drop-zone" : ""
              }
              onClick={() => {
                switchPath(folder.path);
                setShowHiddenFolders(false);
              }}
              onDragEnter={(e) => handleDragEnterOver(e, folder)}
              onDragOver={(e) => handleDragEnterOver(e, folder)}
              onDragLeave={(e) => handleDragLeave(e, folder)}
              onDrop={(e) => handleDrop(e, folder)}
            >
              {folder.name}
            </li>
          ))}
        </ul>
      )}

      {/* Drag Tooltip */}
      {tooltipPosition && dragOverFolder && (
        <Tooltip tooltipPosition={tooltipPosition} name={dragOverFolder.name} />
      )}
    </div>
  );
};

BreadCrumb.propTypes = {
  eventBroker: PropTypes.shape({
    publish: PropTypes.func.isRequired,
  }).isRequired,
};

export default BreadCrumb;
