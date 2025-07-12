import React from 'react';

const DarkModeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <button 
      className="dark-mode-toggle"
      onClick={onToggle}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default DarkModeToggle; 