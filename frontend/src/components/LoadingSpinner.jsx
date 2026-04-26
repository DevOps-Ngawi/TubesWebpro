import React from 'react';

const LoadingSpinner = ({ color = 'warning', message = 'Memuat data soal...' }) => {
  const interStyle = { fontFamily: "'Inter', sans-serif" };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center" style={interStyle}>
      <div className={`spinner-border text-${color}`} role="status"></div>
      <span className="ms-3 fw-medium">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
