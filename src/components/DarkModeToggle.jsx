import React from 'react';

const DarkModeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <button 
      className="dark-mode-toggle"
      onClick={onToggle}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
    >
      {isDarkMode ? '🌙' : '☀️'}
      <span style={{ fontSize: '1em', color: isDarkMode ? '#fff' : '#333', fontWeight: 500 }}>
        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};

export default DarkModeToggle; 