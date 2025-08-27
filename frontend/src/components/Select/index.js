import React from 'react';
import './style.css';

const Select = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false,
  children,
  className = '',
  ...props 
}) => {
  return (
    <div className={`select-container ${className}`}>
      {label && (
        <label htmlFor={name} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      
      <div className="select-wrapper">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="select-field"
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <span className="select-arrow">
          <i className="fas fa-chevron-down"></i>
        </span>
      </div>
    </div>
  );
};

export default Select;