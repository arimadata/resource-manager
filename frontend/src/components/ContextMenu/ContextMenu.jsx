import { useEffect, useRef, useState } from "react";
import { FaChevronRight } from "react-icons/fa6";
import SubMenu from "./SubMenu";
import PropTypes from "prop-types";
import "./ContextMenu.scss";

const ContextMenu = ({ contextMenuRef, menuItems, visible, clickPosition }) => {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [activeSubMenuIndex, setActiveSubMenuIndex] = useState(null);
  const [subMenuPosition, setSubMenuPosition] = useState("right");

  const subMenuRef = useRef(null);

  const contextMenuPosition = () => {
    const { clickX, clickY } = clickPosition;

    // Context menu size
    const contextMenuContainer = contextMenuRef.current.getBoundingClientRect();
    const menuWidth = contextMenuContainer.width;
    const menuHeight = contextMenuContainer.height;

    // Check if there is enough space at the right for the context menu
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const right = viewportWidth - clickX > menuWidth;
    const left = !right;

    const top = viewportHeight - clickY > menuHeight;
    const bottom = !top;

    if (right) {
      setLeft(`${clickX}px`);
      setSubMenuPosition("right");
    } else if (left) {
      // Location: -width of the context menu from cursor's position i.e. left side
      setLeft(`${clickX - menuWidth}px`);
      setSubMenuPosition("left");
    }

    if (top) {
      setTop(`${clickY}px`);
    } else if (bottom) {
      setTop(`${clickY - menuHeight}px`);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseOver = (index) => {
    setActiveSubMenuIndex(index);
  };

  useEffect(() => {
    if (visible && contextMenuRef.current) {
      contextMenuPosition();
    } else {
      setTop(0);
      setLeft(0);
      setActiveSubMenuIndex(null);
    }
  }, [visible]);

  if (visible) {
    return (
      <div
        ref={contextMenuRef}
        onContextMenu={handleContextMenu}
        onClick={(e) => e.stopPropagation()}
        className={`fm-context-menu ${top ? "visible" : "hidden"}`}
        style={{
          top: top,
          left: left,
        }}
      >
        <div className="file-context-menu-list">
          <ul>
            {menuItems
              .filter((item) => !item.hidden)
              .map((item, index) => {
                const hasChildren = Object.prototype.hasOwnProperty.call(
                  item,
                  "children"
                );
                const activeSubMenu =
                  activeSubMenuIndex === index && hasChildren;
                return (
                  <div key={item.title}>
                    <li
                      onClick={item.onClick}
                      className={`${item.className ?? ""} ${
                        activeSubMenu ? "active" : ""
                      }`}
                      onMouseOver={() => handleMouseOver(index)}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      {hasChildren && (
                        <>
                          <FaChevronRight
                            size={14}
                            className="list-expand-icon"
                          />
                          {activeSubMenu && (
                            <SubMenu
                              subMenuRef={subMenuRef}
                              list={item.children}
                              position={subMenuPosition}
                            />
                          )}
                        </>
                      )}
                    </li>
                    {item.divider && <div className="divider"></div>}
                  </div>
                );
              })}
          </ul>
        </div>
      </div>
    );
  }
};

ContextMenu.displayName = "ContextMenu";
ContextMenu.propTypes = {
  contextMenuRef: PropTypes.object.isRequired,
  menuItems: PropTypes.arrayOf(
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
  ).isRequired,
  visible: PropTypes.bool.isRequired,
  clickPosition: PropTypes.object.isRequired,
};

export default ContextMenu;
