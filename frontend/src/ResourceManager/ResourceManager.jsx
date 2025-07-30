import { useEffect } from "react";
import Loader from "../components/Loader/Loader";
import Toolbar from "./Toolbar/Toolbar";
import BreadCrumb from "./BreadCrumb/BreadCrumb";
import ItemList from "./ItemList/ItemList";
import { EventSubscribers } from "./Events/EventSubscribers";
import { ItemsProvider } from "../contexts/ItemsContext";
import { NavigationProvider } from "../contexts/NavigationContext";
import { SelectionProvider } from "../contexts/SelectionContext";
import { ClipBoardProvider } from "../contexts/ClipboardContext";
import { useEventBroker } from "../hooks/useEventBroker";
import { SingleItemProvider } from "../contexts/SingleItemContext";
import PropTypes from "prop-types";
import { dateStringValidator } from "../validators/propValidators";
import "./ResourceManager.scss";

/**
 * ResourceManager Component
 *
 * Super simple modal integration for custom actions.
 * Your callbacks receive (data..., close) and return a cleanup function.
 *
 * @example
 * const onCreate = (item, parentFolder, close) => {
 *   // Show your modal
 *   setShowCreateModal(true);
 *
 *   // Call close() when user completes action
 *   const handleConfirm = async () => {
 *     await createItem(data);
 *     close(); // This closes modal and unlocks system
 *   };
 *
 *   // Return cleanup function (called on ESC, click away, or manual close)
 *   return () => {
 *     setShowCreateModal(false);
 *   };
 * };
 */
const ResourceManager = ({
  items,
  isLoading,
  onCopy,
  onCreateFolder,
  onCreateItem,
  onCut,
  onDelete,
  onFavorite,
  onOpen,
  onPaste,
  onRefresh,
  onRename,
  onSelect,
  onShare,
  allowCreateFolder = true,
  allowCreateItem = true,
  allowShareItem = true,
  allowCut = true,
  allowCopy = true,
  allowFavorite = true,
  allowPaste = true,
  allowRename = true,
  allowDelete = true,
  initialPath = null,
  customEmptySelecCtxItems = [],
  customSelecCtxItems = [],
  height = "100%",
  width = "100%",
  fontFamily = "Nunito Sans, sans-serif",
  primaryColor = "#6155b4",
}) => {
  const customStyles = {
    height,
    width,
    "--file-manager-font-family": fontFamily,
    "--file-manager-primary-color": primaryColor,
    "--file-manager-selected-bg-color": "rgb(209, 227, 255)",
    "--file-manager-hover-bg-color": "rgb(247, 245, 242)",
  };

  const resourceManagerCfg = {
    allowCreateItem,
    allowShareItem,
    allowDelete,
    allowCreateFolder,
    allowCut,
    allowCopy: false, // TODO: Implement copy. Currently not supported.
    allowPaste,
    allowRename,
    allowFavorite,
    createItemLabel: "New item",
  };

  const eventBroker = useEventBroker(resourceManagerCfg);

  return (
    <main
      className="resource-manager"
      onContextMenu={(e) => e.preventDefault()}
      style={customStyles}
    >
      <Loader loading={isLoading} />
      <ItemsProvider itemsData={items}>
        <NavigationProvider initialPath={initialPath || []}>
          <SelectionProvider eventBroker={eventBroker}>
            <ClipBoardProvider eventBroker={eventBroker}>
              {/* Toolbar with "New Folder", "Upload", "Refresh" */}
              {/* On item click: converts to "Cut", "Copy", "Rename", "Download", "Delete", "(n) items selected"*/}
              <SingleItemProvider
                eventBroker={eventBroker}
                resourceManagerCfg={resourceManagerCfg}
                customEmptySelecCtxItems={customEmptySelecCtxItems}
                customSelecCtxItems={customSelecCtxItems}
              >
                <Toolbar
                  resourceManagerCfg={resourceManagerCfg}
                  eventBroker={eventBroker}
                />
                <div className="folders-preview" style={{ width: "100%" }}>
                  <BreadCrumb eventBroker={eventBroker} />
                  {/* Main section with files and folders */}
                  <ItemList eventBroker={eventBroker} />
                </div>
                {/* Event subscriber section such as "Delete" modal */}
                <EventSubscribers
                  resourceManagerCfg={resourceManagerCfg}
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
                  eventBroker={eventBroker}
                />
              </SingleItemProvider>
            </ClipBoardProvider>
          </SelectionProvider>
        </NavigationProvider>
      </ItemsProvider>
    </main>
  );
};

ResourceManager.displayName = "ResourceManager";

ResourceManager.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      // Original structure fields
      pk: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      itemType: PropTypes.oneOf(["folder", "resource"]).isRequired,
      iconName: PropTypes.string,
      isFavorited: PropTypes.bool,
      parentPk: PropTypes.string,
      scope: PropTypes.string,
      scopePk: PropTypes.string,
      createdAt: dateStringValidator,
      updatedAt: dateStringValidator,
      resource: PropTypes.object,
      resourcePk: PropTypes.string,
      resourceType: PropTypes.string,

      // Computed fields (added by ItemsContext)
      isDirectory: PropTypes.bool,
      path: PropTypes.string,
      isEditing: PropTypes.bool,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  onCreate: PropTypes.func,
  onRename: PropTypes.func,
  onDelete: PropTypes.func,
  onCut: PropTypes.func,
  onCopy: PropTypes.func,
  onPaste: PropTypes.func,
  onShare: PropTypes.func,
  onFavorite: PropTypes.func,
  onRefresh: PropTypes.func,
  onSelect: PropTypes.func,
  allowCreateFolder: PropTypes.bool,
  allowCreateItem: PropTypes.bool,
  allowShareItem: PropTypes.bool,
  allowCut: PropTypes.bool,
  allowCopy: PropTypes.bool,
  allowFavorite: PropTypes.bool,
  allowOpen: PropTypes.bool,
  allowPaste: PropTypes.bool,
  allowRename: PropTypes.bool,
  allowDelete: PropTypes.bool,
  initialPath: PropTypes.arrayOf(PropTypes.string), // can be empty
  customEmptySelecCtxItems: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      onClick: PropTypes.func,
      divider: PropTypes.bool,
      hidden: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
      className: PropTypes.string,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
          onClick: PropTypes.func,
          hidden: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
          className: PropTypes.string,
        })
      ),
    })
  ),
  customSelecCtxItems: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      onClick: PropTypes.func,
      divider: PropTypes.bool,
      hidden: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
      className: PropTypes.string,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
          onClick: PropTypes.func,
          hidden: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
          className: PropTypes.string,
        })
      ),
    })
  ),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  primaryColor: PropTypes.string,
  fontFamily: PropTypes.string,
};

export default ResourceManager;
