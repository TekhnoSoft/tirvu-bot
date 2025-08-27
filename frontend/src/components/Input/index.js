import React from 'react';
import './style.css';

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false,
  icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={`input-container ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className={`input-wrapper ${icon ? 'has-icon' : ''}`}>
        {icon && (
          <span className="input-icon">
            <i className={icon}></i>
          </span>
        )}
        
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="input-field"
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;