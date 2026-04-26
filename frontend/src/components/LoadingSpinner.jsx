import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ color = 'warning', message = 'Memuat data soal...' }) => {
  const interStyle = { fontFamily: "'Inter', sans-serif" };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center" style={interStyle}>
      <output className={`spinner-border text-${color}`}></output>
      <span className="ms-3 fw-medium">{message}</span>
    </div>
  );
};

LoadingSpinner.propTypes = {
  color: PropTypes.string,
  message: PropTypes.string,
};

export default LoadingSpinner;

