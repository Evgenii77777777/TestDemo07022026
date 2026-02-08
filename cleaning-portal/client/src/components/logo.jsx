import React from 'react';

const Logo = ({ size = 'medium', showText = true }) => {
  const sizes = {
    small: { width: 40, fontSize: '0.9rem' },
    medium: { width: 60, fontSize: '1.5rem' },
    large: { width: 100, fontSize: '2rem' }
  };
  
  const currentSize = sizes[size] || sizes.medium;

  return (
    <div className="logo-container">
      <img 
        src="/images/logo.png" 
        alt="" 
        className="logo-img"
        style={{ width: currentSize.width }}
      />
      {showText && (
        <span 
          className="logo-text" 
          style={{ fontSize: currentSize.fontSize }}
        >
          «Мой Не Сам»
        </span>
      )}
    </div>
  );
};

export default Logo;