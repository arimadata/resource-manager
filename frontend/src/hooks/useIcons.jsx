import * as BsIcons from "react-icons/bs";

/**
 * Hook to dynamically access react-icons/fa6 icons by string name
 * https://react-icons.github.io/react-icons/icons/fa6/
 * @param {string} iconName - The name of the icon (e.g., "FaRegFaceLaughSquint", "FaHome", "FaBeer")
 * @param {number|string} size - The size of the icon (optional)
 * @param {object} props - Additional props to pass to the icon component (optional)
 * @returns {JSX.Element|null} The icon component or null if not found
 *
 * @example
 * const getIcon = useIcons();
 * const homeIcon = getIcon("FaHome", 24);
 * const laughIcon = getIcon("FaRegFaceLaughSquint", "2em", { color: "red" });
 */
export const useIcon = () => {
  const getIcon = (iconName, size, props = {}) => {
    const IconComponent = BsIcons[iconName];
    if (!IconComponent) {
      console.warn(`Icon "${iconName}" not found in react-icons/fa6`);
      console.warn(`Available icons: ${Object.keys(BsIcons).join(", ")}`);
      return null;
    }

    // Return the icon component with size and additional props
    return <IconComponent size={size} {...props} />;
  };

  return getIcon;
};
