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
import { SortingProvider } from "../contexts/SortingContext";
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
  headers,
  items,
  isLoading,
  onCopy,
  onCreateFolder,
  onCreateItem,
  renderCustomToolbar,
  onCut,
  onDelete,
  onDuplicate,
  onFavorite,
  onOpen,
  onPaste,
  onRefresh,
  onRename,
  onSelect,
  onShare,
  onPathChange,
  allowOpen = () => true,
  allowCreateFolder = true,
  allowCreateItem = true,
  allowShareItem = true,
  allowCut = true,
  // allowCopy = true,
  allowFavorite = true,
  allowRefresh = true,
  allowPaste = true,
  allowRename = true,
  allowDelete = true,
  allowDuplicate = false,
  createItemLabel = "New Item",
  initialPath = null,
  customEmptySelectCtxItems = [],
  customSelectCtxItems = [],
  height = "auto",
  width = "100%",
  fontFamily = "Rubik, sans-serif",
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
    allowRefresh,
    allowCut,
    allowCopy: false, // TODO: Implement copy. Currently not supported.
    allowPaste,
    allowRename,
    allowFavorite,
    allowOpen,
    allowDuplicate,
    createItemLabel,
  };

  const eventBroker = useEventBroker(resourceManagerCfg);

  return (
    <main
      className="resource-manager"
      onContextMenu={(e) => e.preventDefault()}
      style={customStyles}
    >
      <SortingProvider>
        <ItemsProvider itemsData={items}>
          <NavigationProvider
            initialPath={initialPath || []}
            headers={headers}
            onPathChange={onPathChange}
          >
            <SelectionProvider eventBroker={eventBroker}>
              <ClipBoardProvider eventBroker={eventBroker}>
                {/* Toolbar with "New Folder", "Upload", "Refresh" */}
                {/* On item click: converts to "Cut", "Copy", "Rename", "Download", "Delete", "(n) items selected"*/}
                <SingleItemProvider
                  eventBroker={eventBroker}
                  resourceManagerCfg={resourceManagerCfg}
                  customEmptySelectCtxItems={customEmptySelectCtxItems}
                  customSelectCtxItems={customSelectCtxItems}
                >
                  <Toolbar
                    resourceManagerCfg={resourceManagerCfg}
                    eventBroker={eventBroker}
                    renderCustomToolbar={renderCustomToolbar}
                  />
                  <div className="folders-preview" style={{ width: "100%" }}>
                    <BreadCrumb eventBroker={eventBroker} />
                    {/* Main section with files and folders */}
                    <ItemList
                      eventBroker={eventBroker}
                      headers={headers}
                      isLoading={isLoading}
                      primaryColor={primaryColor}
                      allowOpen={allowOpen}
                    />
                  </div>
                  {/* Event subscriber section such as "Delete" modal */}
                  <EventSubscribers
                    resourceManagerCfg={resourceManagerCfg}
                    onCopy={onCopy}
                    onCreateFolder={onCreateFolder}
                    onCreateItem={onCreateItem}
                    onCut={onCut}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
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
      </SortingProvider>
    </main>
  );
};

ResourceManager.displayName = "ResourceManager";
ResourceManager.propTypes = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      columnName: PropTypes.string.isRequired,
      getValue: PropTypes.func.isRequired,
      sortAccessor: PropTypes.func,
      isNameColumn: PropTypes.bool,
    })
  ).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      // Original structure fields
      pk: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
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
      path: PropTypes.arrayOf(PropTypes.string),
      isEditing: PropTypes.bool,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  onCreateFolder: PropTypes.func,
  onCreateItem: PropTypes.func,
  onCreate: PropTypes.func,
  onRename: PropTypes.func,
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func,
  onOpen: PropTypes.func,
  allowOpen: PropTypes.func,
  onCut: PropTypes.func,
  onCopy: PropTypes.func,
  onPaste: PropTypes.func,
  onShare: PropTypes.func,
  onFavorite: PropTypes.func,
  onRefresh: PropTypes.func,
  allowRefresh: PropTypes.bool,
  onSelect: PropTypes.func,
  onPathChange: PropTypes.func,
  allowCreateFolder: PropTypes.bool,
  allowCreateItem: PropTypes.bool,
  allowShareItem: PropTypes.bool,
  allowCut: PropTypes.bool,
  allowCopy: PropTypes.bool,
  allowFavorite: PropTypes.bool,
  allowPaste: PropTypes.bool,
  allowRename: PropTypes.bool,
  allowDelete: PropTypes.bool,
  allowDuplicate: PropTypes.bool,
  createItemLabel: PropTypes.string,
  initialPath: PropTypes.arrayOf(PropTypes.string), // can be empty
  customEmptySelectCtxItems: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      onClick: PropTypes.func,
      divider: PropTypes.bool,
      hidden: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
      className: PropTypes.string,
      shortcut: PropTypes.arrayOf(PropTypes.string),
      children: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
          onClick: PropTypes.func,
          hidden: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
          className: PropTypes.string,
          shortcut: PropTypes.arrayOf(PropTypes.string),
        })
      ),
    })
  ),
  customSelectCtxItems: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      onClick: PropTypes.func,
      divider: PropTypes.bool,
      hidden: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
      className: PropTypes.string,
      shortcut: PropTypes.arrayOf(PropTypes.string),
      children: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
          onClick: PropTypes.func,
          hidden: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
          className: PropTypes.string,
          shortcut: PropTypes.arrayOf(PropTypes.string),
        })
      ),
    })
  ),
  renderCustomToolbar: PropTypes.node,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  primaryColor: PropTypes.string,
  fontFamily: PropTypes.string,
};

export default ResourceManager;
