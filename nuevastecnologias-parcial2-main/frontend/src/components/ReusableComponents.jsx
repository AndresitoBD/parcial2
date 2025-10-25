// Components/ReusableComponents.js
import React from 'react';

// StatCard component
export function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-content">
        <div className="stat-info">
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
        </div>
        <Icon size={48} className="stat-icon" />
      </div>
    </div>
  );
}

