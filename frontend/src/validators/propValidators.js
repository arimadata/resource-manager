export const dateStringValidator = (props, propName, componentName) => {
  const value = props[propName];

  if (value && isNaN(Date.parse(value))) {
    return new Error(
      `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected a valid date string (ISO 8601) but received \`${value}\`.`
    );
  }
};
