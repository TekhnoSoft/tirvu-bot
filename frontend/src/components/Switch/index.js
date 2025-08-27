import React from 'react';
import PropTypes from 'prop-types';
import './style.css';

const Switch = ({ 
  checked, 
  onChange, 
  disabled, 
  size = 'medium',
  color = 'primary',
  className = '',
  label = '',
  name = ''
}) => {
  const handleChange = (e) => {
    if (onChange && !disabled) {
      onChange(e.target.checked, name);
    }
  };

  const switchClasses = [
    'switch-component',
    `switch-${size}`,
    `switch-${color}`,
    disabled ? 'switch-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={switchClasses}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        name={name}
        className="switch-input"
      />
      <span className="switch-slider"></span>
      {label && <span className="switch-label">{label}</span>}
    </label>
  );
};

Switch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info']),
  className: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string
};

export default Switch;