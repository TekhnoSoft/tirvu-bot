import React from 'react';
import './style.css';

const Logo = ({ size = 'medium', className = '', light = false }) => {
  return (
    <div className={`logo logo-${size} ${light ? 'logo-light' : ''} ${className}`}>
      <span className="logo-text">VBOT</span>
      <span className="logo-dot"></span>
      <span className="logo-tagline">Campanhas Inteligentes</span>
    </div>
  );
};

export default Logo;