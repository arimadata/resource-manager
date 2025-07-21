import { useState, useEffect } from "react";

// All possible actions/events by category
const EVENT_CATEGORIES = {
  RELEASE: "release",
  LOCK: "lock",
  MODAL: "modal",
  INLINE: "inline",
  INLINE_COMPLETE: "inline_complete",
  NON_BLOCKING: "non_blocking",
};

// All possible states
const STATES = {
  IDLE: "idle",
  LOCKED: "locked",
  MODAL_ACTIVE: "modal_active",
  INLINE_EDITING: "inline_editing",
  NON_BLOCKING: "non_blocking",
};

// Target state for each category
const EVENT_TO_TARGET_STATE = {
  [EVENT_CATEGORIES.LOCK]: STATES.LOCKED,
  [EVENT_CATEGORIES.RELEASE]: STATES.IDLE,
  [EVENT_CATEGORIES.MODAL]: STATES.MODAL_ACTIVE,
  [EVENT_CATEGORIES.INLINE]: STATES.INLINE_EDITING,
  [EVENT_CATEGORIES.INLINE_COMPLETE]: STATES.NON_BLOCKING,
  [EVENT_CATEGORIES.NON_BLOCKING]: STATES.NON_BLOCKING,
};

// Allowed event categories by state
const ALLOWED_EVENTS_BY_STATE = {
  // From IDLE, we allow all events
  [STATES.IDLE]: [
    EVENT_CATEGORIES.LOCK,
    EVENT_CATEGORIES.RELEASE,
    EVENT_CATEGORIES.MODAL,
    EVENT_CATEGORIES.INLINE,
    EVENT_CATEGORIES.INLINE_COMPLETE,
    EVENT_CATEGORIES.NON_BLOCKING,
  ],
  // From LOCKED, we only allow RELEASE
  [STATES.LOCKED]: [
    // EVENT_CATEGORIES.LOCK,
    EVENT_CATEGORIES.RELEASE,
    // EVENT_CATEGORIES.MODAL,
    // EVENT_CATEGORIES.INLINE,
    // EVENT_CATEGORIES.INLINE_COMPLETE,
    // EVENT_CATEGORIES.NON_BLOCKING,
  ],
  // From MODAL_ACTIVE, we only allow LOCK or RELEASE
  [STATES.MODAL_ACTIVE]: [
    EVENT_CATEGORIES.LOCK,
    EVENT_CATEGORIES.RELEASE,
    // EVENT_CATEGORIES.MODAL,
    // EVENT_CATEGORIES.INLINE,
    // EVENT_CATEGORIES.INLINE_COMPLETE,
    // EVENT_CATEGORIES.NON_BLOCKING,
  ],
  // From INLINE_EDITING, we only allow INLINE_EDITING, LOCK, or RELEASE
  [STATES.INLINE_EDITING]: [
    EVENT_CATEGORIES.LOCK,
    EVENT_CATEGORIES.RELEASE,
    // EVENT_CATEGORIES.MODAL,
    // EVENT_CATEGORIES.INLINE,
    EVENT_CATEGORIES.INLINE_COMPLETE,
    // EVENT_CATEGORIES.NON_BLOCKING,
  ],
  // From NON_BLOCKING, we allow all events
  [STATES.NON_BLOCKING]: [
    EVENT_CATEGORIES.LOCK,
    EVENT_CATEGORIES.RELEASE,
    EVENT_CATEGORIES.MODAL,
    EVENT_CATEGORIES.INLINE,
    EVENT_CATEGORIES.INLINE_COMPLETE,
    EVENT_CATEGORIES.NON_BLOCKING,
  ],
};

export const useEventBroker = (resourceManagerCfg) => {
  /*
   * Event Broker for Resource Manager's Events w/ Finite State Machine
   *
   * ## Core Concepts:
   *
   * ### Event Categories:
   * - **MODAL**: Block all events until completed (deleteItems, shareItems, createItem)
   * - **INLINE**: Blocks all events until it is done (self managed)
   * - **NON_BLOCKING**: Allow all events (selections, copy/paste, favorites)
   * - **SYSTEM**: Always allowed (cancel, refresh)
   *
   * ### State Machine:
   * - `idle`: No active event
   * - `modal_active`: Modal event in progress
   * - `inline_editing`: Inline editing in progress
   * - `non_blocking`: Non-blocking event in progress
   *
   * ### Transition Rules:
   * - SYSTEM events always allowed
   * - From IDLE: Any event allowed
   * - From NON_BLOCKING: Any event allowed
   * - From MODAL_ACTIVE: Only SYSTEM events allowed
   * - From INLINE_EDITING: Only SYSTEM and completion events allowed (e.g., renameItem -> renameItemDone)
   *
   * ## Usage:
   * ```javascript
   * const eventBroker = useEventBroker(config);
   *
   * // Publish event
   * const result = eventBroker.publish("deleteItems", selectedItems);
   * if (!result.success) {
   *   console.warn("Event blocked:", result.reason);
   * }
   *
   * // Check if event can be published
   * if (eventBroker.canPublish("renameItem")) {
   *   eventBroker.publish("renameItem", item);
   * }
   *
   * // Complete current event and release the UI
   * eventBroker.release();
   * ```
   */

  const [state, setState] = useState(STATES.IDLE);
  const [event, setEvent] = useState(null);
  const [data, setData] = useState(null);
  const [eventCounter, setEventCounter] = useState(0);
  const [eventRegistry, setEventRegistry] = useState(null);

  //////////////////////////////////////////////////////////////
  // Finate State Machine
  const modalEvents = ["createItem", "shareItems"];
  const inlineEvents = ["createFolder", "renameItem", "deleteItems"];
  const inlineCompleteEvents = [
    "createFolderDone",
    "renameItemDone",
    "deleteItemsDone",
  ];
  const nonBlockingEvents = [
    "copyItems",
    "copyItemsDone",
    "cutItems",
    "cutItemsDone",
    "pasteItems",
    "pasteItemsDone",
    "toggleFavorite",
    // Selection events
    "selectItems",
    "selectItemsDone",
    "selectFirst",
    "selectLast",
    "selectAll",
    "unselectAll",
    "selectArrowUp",
    "selectArrowDown",
    "navigateUp",
    "navigateDown",
    // Navigation events
    "switchPath",
    // Clipboard events
    "copyItems",
    "copyItemsDone",
    "cutItems",
    "cutItemsDone",
    "pasteItems",
    "pasteItemsDone",
    // Item interactions
    "openItem",
    "toggleFavorite",
  ];
  const releaseEvents = ["cancel", "refresh", "release"];
  const lockEvents = ["userLocked"];

  useEffect(() => {
    const eventEnabled = (eventName) => {
      // Map event names to configuration permissions
      const eventEnabledMap = {
        createItem: resourceManagerCfg.allowCreateItem,
        shareItems: resourceManagerCfg.allowShareItem,
        deleteItems: resourceManagerCfg.allowDelete,
        createFolder: resourceManagerCfg.allowCreateFolder,
        createFolderDone: resourceManagerCfg.allowCreateFolder,
        cutItems: resourceManagerCfg.allowCut,
        cutItemsDone: resourceManagerCfg.allowCut,
        copyItems: resourceManagerCfg.allowCopy,
        copyItemsDone: resourceManagerCfg.allowCopy,
        pasteItems: resourceManagerCfg.allowPaste,
        pasteItemsDone: resourceManagerCfg.allowPaste,
        renameItem: resourceManagerCfg.allowRename,
        renameItemDone: resourceManagerCfg.allowRename,
        toggleFavorite: resourceManagerCfg.allowFavorite,
      };

      return eventEnabledMap[eventName] || true;
    };

    const registerEvents = (events, eventCategory, registry) => {
      for (const eventName of events) {
        if (eventEnabled(eventName)) {
          registry[eventName] = {
            category: eventCategory,
            targetState: EVENT_TO_TARGET_STATE[eventCategory],
          };
        }
      }
    };

    // Register all events
    const registry = {};
    registerEvents(modalEvents, EVENT_CATEGORIES.MODAL, registry);
    registerEvents(inlineEvents, EVENT_CATEGORIES.INLINE, registry);
    registerEvents(
      inlineCompleteEvents,
      EVENT_CATEGORIES.INLINE_COMPLETE,
      registry
    );
    registerEvents(nonBlockingEvents, EVENT_CATEGORIES.NON_BLOCKING, registry);
    registerEvents(releaseEvents, EVENT_CATEGORIES.RELEASE, registry);
    registerEvents(lockEvents, EVENT_CATEGORIES.LOCK, registry);

    // Set state
    setEventRegistry(registry);
  }, []);

  const canTransition = (event, logReason = false) => {
    const transitionCheck = _canTransition(event);
    if (logReason && !transitionCheck.allowed) {
      console.warn(`Event "${event}" not allowed: ${transitionCheck.reason}`);
    }
    return transitionCheck.allowed;
  };

  const _canTransition = (event) => {
    const currentState = state;
    const eventCategory = eventRegistry[event].category;
    const targetState = eventRegistry[event].targetState;
    if (!eventCategory) {
      return {
        allowed: false,
        reason: `Invalid event type: ${event}.`,
      };
    } else if (!targetState) {
      return {
        allowed: false,
        reason: `Invalid target state for event: ${event}.`,
      };
    } else if (!ALLOWED_EVENTS_BY_STATE[currentState].includes(eventCategory)) {
      return {
        allowed: false,
        reason: `Event "${event}" cannot transition out of state "${currentState}".`,
      };
    }
    return { allowed: true };
  };

  //////////////////////////////////////////////////////////////
  // Event Publishing

  const publish = (event, data = null) => {
    if (!eventRegistry[event]) {
      let error = `Invalid event type: ${event}.`;
      console.error(error);
      return { success: false, reason: error };
    }

    const targetState = eventRegistry[event].targetState;
    // eg; can we transition
    // from <state:modal_active> to <targetState:inline_editing>
    // given event is <event:createFolder>
    const transitionCheck = _canTransition(event);
    if (!transitionCheck.allowed) {
      console.warn(`Event "${event}" blocked: ${transitionCheck.reason}`);
      return transitionCheck;
    }

    // Valid transition - update state
    setData(data);
    setState(targetState);
    setEvent(event);
    setEventCounter((prev) => prev + 1); // Subscribers listen to this
    return { success: true };
  };

  // Check if UI is in inline editing mode
  const isInlineEditing = () => {
    return [STATES.INLINE_EDITING, STATES.INLINE_COMPLETE].includes(state);
  };

  // Check if UI is locked (eg; modal is open or inline editing is active)
  const isLocked = () => {
    return [
      STATES.LOCKED,
      STATES.MODAL_ACTIVE,
      STATES.INLINE_EDITING,
      STATES.NON_BLOCKING,
    ].includes(state);
  };

  // Check if this is an event that requires a user defined modal
  const isModalEvent = () => {
    return [STATES.MODAL_ACTIVE].includes(state);
  };

  return {
    // State information
    state,
    event,
    data,
    eventCounter,

    // State checks
    isInlineEditing,
    isLocked,
    isModalEvent,
    canTransition,

    // Actions
    publish,
  };
};
