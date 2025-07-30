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

export default SubMenu;
