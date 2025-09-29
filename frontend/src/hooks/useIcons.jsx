import * as BsIcons from "react-icons/bs";

/**
 * Hook to dynamically access react-icons/bs icons by string name
 * https://react-icons.github.io/react-icons/icons/bs/
 * @param {string} iconName - The name of the icon (e.g., "BsFileEarmarkFill", "BsFolderFill", "BsPeopleFill")
 * @param {number|string} size - The size of the icon (optional)
 * @param {object} props - Additional props to pass to the icon component (optional)
 * @returns {JSX.Element|null} The icon component or null if not found
 *
 * @example
 * const getIcon = useIcons();
 * const homeIcon = getIcon("BsFileEarmarkFill", 24);
 * const laughIcon = getIcon("BsFolderFill", "2em", { color: "red" });
 */
export const useIcon = () => {
  const getIcon = (iconName, size, props = {}) => {
    const IconComponent = BsIcons[iconName];
    if (!IconComponent) {
      console.warn(`Icon "${iconName}" not found in react-icons/bs`);
      console.warn(`Available icons: ${Object.keys(BsIcons).join(", ")}`);
      return null;
    }

    // Return the icon component with size and additional props
    return <IconComponent size={size} {...props} />;
  };

  return getIcon;
};
