import {
  BsCopy,
  BsFolderPlus,
  BsScissors,
  BsFileEarmarkPlus,
  BsFiles,
} from "react-icons/bs";
import { FiRefreshCw } from "react-icons/fi";
import { MdClear, MdOutlineDelete } from "react-icons/md";
import { BiRename } from "react-icons/bi";
import { FaRegPaste, FaArrowUpFromBracket } from "react-icons/fa6";
import { useNavigation } from "../../contexts/NavigationContext";
import { useSelection } from "../../contexts/SelectionContext";
import { useClipBoard } from "../../contexts/ClipboardContext";
import PropTypes from "prop-types";
import "./Toolbar.scss";

const Toolbar = ({ resourceManagerCfg, eventBroker, renderCustomToolbar }) => {
  const { currentFolder } = useNavigation();
  const { selectedItems } = useSelection();
  const { clipBoard } = useClipBoard();
  // Toolbar with nothing selected //
  const toolbarLeftItems = [
    {
      icon: <BsFolderPlus size={17} strokeWidth={0.3} />,
      text: "New folder",
      show: !!resourceManagerCfg.allowCreateFolder,
      onClick: () => eventBroker.publish("createFolder"),
    },
    {
      icon: <BsFileEarmarkPlus size={18} />,
      text: resourceManagerCfg.createItemLabel || "New item",
      show: !!resourceManagerCfg.allowCreateItem,
      onClick: () => eventBroker.publish("createItem"),
    },
    {
      icon: <FaRegPaste size={18} />,
      text: "Paste",
      show: !!resourceManagerCfg.allowPaste,
      disabled: !clipBoard?.items?.length,
      onClick: () => eventBroker.publish("pasteItems", currentFolder),
    },
  ];

  const toolbarRightItems = [
    {
      icon: <FiRefreshCw size={16} />,
      show: !!resourceManagerCfg.allowRefresh,
      title: "Refresh",
      onClick: () => eventBroker.publish("refresh"),
    },
  ];

  // Toolbar with selected items //
  if (selectedItems.length > 0) {
    return (
      <div className="toolbar item-selected">
        <div className="item-action-container">
          <div>
            {/* Share selected items - must have >= 1 non-directory item selected */}
            {resourceManagerCfg.allowShareItem && (
              <button
                className="item-action f-action primary-action"
                onClick={() => eventBroker.publish("shareItems")}
                disabled={selectedItems.some((file) => file.isDirectory)}
              >
                <FaArrowUpFromBracket size={16} />
                <span>Share</span>
              </button>
            )}
            {/* Cut selected items - must have >= 1 item selected */}
            {resourceManagerCfg.allowCut && (
              <button
                className="item-action f-action"
                onClick={() => eventBroker.publish("cutItems")}
              >
                <BsScissors size={18} />
                <span>Cut</span>
              </button>
            )}
            {/* Duplicate selected items - must have >= 1 item selected */}
            {resourceManagerCfg.allowDuplicate &&
              selectedItems.every((file) => file.itemType === "resource") && (
                <button
                  className="item-action f-action"
                  onClick={() => eventBroker.publish("duplicateItems")}
                >
                  <BsFiles size={18} />
                  <span>Duplicate</span>
                </button>
              )}
            {/* Copy selected items - must have >= 1 item selected */}
            {resourceManagerCfg.allowCopy && (
              <button
                className="item-action f-action"
                onClick={() => eventBroker.publish("copyItems")}
              >
                <BsCopy strokeWidth={0.1} size={17} />
                <span>Copy</span>
              </button>
            )}
            {/* Paste selected items - must have >= 1 item copied */}
            {resourceManagerCfg.allowPaste && (
              <button
                className="item-action f-action"
                onClick={() => eventBroker.publish("pasteItems", currentFolder)}
                disabled={!clipBoard?.items?.length}
              >
                <FaRegPaste size={18} />
                <span>Paste</span>
              </button>
            )}

            {/* Rename selected item - must have == 1 item selected */}
            {resourceManagerCfg.allowRename && (
              <button
                className="item-action f-action"
                onClick={() => eventBroker.publish("renameItem")}
                disabled={selectedItems.length !== 1}
              >
                <BiRename size={19} />
                <span>Rename</span>
              </button>
            )}
            {/* Delete selected items - must have >= 1 item selected */}
            {resourceManagerCfg.allowDelete && (
              <button
                className="item-action f-action"
                onClick={() => eventBroker.publish("deleteItems")}
              >
                <MdOutlineDelete size={19} />
                <span>Delete</span>
              </button>
            )}
          </div>
          {/* Clear selection */}
          <button
            className="item-action f-action"
            title="Clear selection"
            onClick={() => eventBroker.publish("unselectAll")}
          >
            <span>
              {selectedItems.length} item{selectedItems.length > 1 && "s"}{" "}
              selected
            </span>
            <MdClear size={18} />
          </button>
        </div>
      </div>
    );
  }
  //

  return (
    <div className="toolbar">
      <div className="fm-toolbar">
        <div className="toolbar-left-items">
          {toolbarLeftItems
            .filter((item) => item.show)
            .map((item, index) => (
              <button
                className="item-action"
                key={index}
                onClick={item.onClick}
                disabled={item.disabled}
              >
                {item.icon}
                <span>{item.text}</span>
              </button>
            ))}
          {renderCustomToolbar}
        </div>
        <div>
          {toolbarRightItems
            .filter((item) => item.show)
            .map((item, index) => (
              <div key={index} className="toolbar-right-items">
                <button
                  className="item-action icon-only"
                  title={item.title}
                  onClick={item.onClick}
                >
                  {item.icon}
                </button>
                {index !== toolbarRightItems.length - 1 && (
                  <div className="item-separator"></div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

Toolbar.displayName = "Toolbar";
Toolbar.propTypes = {
  resourceManagerCfg: PropTypes.shape({
    allowCreateItem: PropTypes.bool,
    allowCreateFolder: PropTypes.bool,
    allowShareItem: PropTypes.bool,
    allowCut: PropTypes.bool,
    allowCopy: PropTypes.bool,
    allowPaste: PropTypes.bool,
    allowRename: PropTypes.bool,
    createItemLabel: PropTypes.string,
    allowDelete: PropTypes.bool,
    allowFavorite: PropTypes.bool,
    allowDuplicate: PropTypes.bool,
    allowRefresh: PropTypes.bool,
  }).isRequired,
  eventBroker: PropTypes.shape({
    publish: PropTypes.func,
    canTransition: PropTypes.func,
    isInlineEditing: PropTypes.func,
    isLocked: PropTypes.func,
    isModalEvent: PropTypes.func,
    state: PropTypes.string,
    event: PropTypes.string,
    data: PropTypes.object,
    eventCounter: PropTypes.number,
  }).isRequired,
  renderCustomToolbar: PropTypes.node,
};

export default Toolbar;
