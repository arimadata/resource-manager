import PropTypes from "prop-types";

const SubMenu = ({ subMenuRef, list, position = "right" }) => {
  return (
    <ul ref={subMenuRef} className={`sub-menu ${position}`}>
      {list
        ?.filter((item) => !item.hidden)
        ?.map((item) => (
          <li key={item.title} onClick={item.onClick}>
            <span>{item.icon}</span>
            <span>{item.title}</span>
          </li>
        ))}
    </ul>
  );
};

SubMenu.displayName = "SubMenu";
SubMenu.propTypes = {
  subMenuRef: PropTypes.object.isRequired,
  list: PropTypes.array.isRequired,
  position: PropTypes.string,
};

export default SubMenu;
