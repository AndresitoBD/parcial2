import React from 'react';
import '../styles/components.css';

function Button({ children, onClick, type = 'button', disabled = false }) {
  return (
    <button className="btn" type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;