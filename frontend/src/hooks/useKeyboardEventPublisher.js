import { useKeyPress } from "./useKeyPress";
import { shortcuts } from "../utils/shortcuts";
import { useNavigation } from "../contexts/NavigationContext";

export const useKeyboardEventPublisher = ({
  eventBroker,
  resourceManagerCfg,
}) => {
  const { currentFolder } = useNavigation();

  const triggerCreateFolder = () => {
    eventBroker.publish("createFolder");
  };

  const triggerCutItems = () => {
    eventBroker.publish("cutItems");
  };

  const triggerCopyItems = () => {
    eventBroker.publish("copyItems");
  };

  const triggerPasteItems = () => {
    eventBroker.publish("pasteItems", currentFolder);
  };

  const triggerRename = () => {
    eventBroker.publish("renameItem");
  };

  const triggerDelete = () => {
    eventBroker.publish("deleteItems");
  };

  const triggerOpen = () => {
    eventBroker.publish("openItem");
  };

  const triggerSelectFirst = () => {
    eventBroker.publish("selectFirst");
  };

  const triggerSelectLast = () => {
    eventBroker.publish("selectLast");
  };

  const triggerSelectAll = () => {
    eventBroker.publish("selectAll");
  };

  const triggerCancel = () => {
    eventBroker.publish("cancel");
  };

  const triggerRefresh = () => {
    eventBroker.publish("refresh");
  };

  const triggerSelectArrowUp = () => {
    eventBroker.publish("selectArrowUp");
  };

  const triggerSelectArrowDown = () => {
    eventBroker.publish("selectArrowDown");
  };

  const triggerNavigateUp = () => {
    eventBroker.publish("navigateUp");
  };

  const triggerNavigateDown = () => {
    eventBroker.publish("navigateDown");
  };

  // Keypress detection will be disabled when an event is locked or
  // not allowed by the resource manager cfg.
  useKeyPress(
    shortcuts.createFolder,
    triggerCreateFolder,
    !resourceManagerCfg.allowCreateFolder
  );
  useKeyPress(shortcuts.cut, triggerCutItems, !resourceManagerCfg.allowCut);
  useKeyPress(shortcuts.copy, triggerCopyItems, !resourceManagerCfg.allowCopy);
  useKeyPress(
    shortcuts.paste,
    triggerPasteItems,
    !resourceManagerCfg.allowPaste
  );
  useKeyPress(shortcuts.rename, triggerRename, !resourceManagerCfg.allowRename);
  useKeyPress(shortcuts.delete, triggerDelete, !resourceManagerCfg.allowDelete);
  useKeyPress(shortcuts.open, triggerOpen);
  useKeyPress(shortcuts.jumpToFirst, triggerSelectFirst);
  useKeyPress(shortcuts.jumpToLast, triggerSelectLast);
  useKeyPress(shortcuts.selectAll, triggerSelectAll);
  useKeyPress(shortcuts.cancel, triggerCancel);
  useKeyPress(
    shortcuts.refresh,
    triggerRefresh,
    !resourceManagerCfg.allowRefresh
  );
  useKeyPress(shortcuts.selectArrowUp, triggerSelectArrowUp);
  useKeyPress(shortcuts.selectArrowDown, triggerSelectArrowDown);
  useKeyPress(shortcuts.navigateUp, triggerNavigateUp);
  useKeyPress(shortcuts.navigateDown, triggerNavigateDown);
};
