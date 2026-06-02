import React from 'react';
import { Icon } from 'semantic-ui-react';

const SearchActionIcon = ({ loading, onRemove, onStop, search, ...props }) => {
  if (loading) {
    return (
      <Icon
        loading
        name="spinner"
        {...props}
      />
    );
  }

  if (search.state.includes('Completed')) {
    return (
      <Icon
        className="clickable"
        color="red"
        name="trash alternate"
        onClick={() => onRemove()}
      />
    );
  }

  return (
    <Icon
      className="clickable"
      color="red"
      name="stop circle"
      onClick={() => onStop()}
    />
  );
};

export default SearchActionIcon;
