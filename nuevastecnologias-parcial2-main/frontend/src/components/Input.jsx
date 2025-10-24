import React from 'react';
import '../styles/components.css';

function Input({ type = 'text', placeholder, value, onChange, required = false }) {
  return (
    <input
      className="input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
}

export default Input;