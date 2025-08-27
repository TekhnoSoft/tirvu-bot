// LoadingScreen.jsx
import React from 'react';
import './style.css';
import Logo from '../Logo';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-logo">
          <Logo/>
        </div>
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
          <div className="spinner-circle-inner"></div>
        </div>
        <div className="loading-text">
          <span>C</span>
          <span>a</span>
          <span>r</span>
          <span>r</span>
          <span>e</span>
          <span>g</span>
          <span>a</span>
          <span>n</span>
          <span>d</span>
          <span>o</span>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;