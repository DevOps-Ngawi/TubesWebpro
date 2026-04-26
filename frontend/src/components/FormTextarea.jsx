import React from 'react';
import PropTypes from 'prop-types';

const FormTextarea = ({ 
  label, 
  value, 
  onChange, 
  error, 
  placeholder, 
  rows = "3", 
  minHeight = "100px",
  maxHeight = "180px",
  className = "mb-4"
}) => {
  const interStyle = { fontFamily: "'Inter', sans-serif" };
  
  return (
    <div className={className}>
      <label className="form-label fw-bold small text-secondary text-uppercase mb-2"
        style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
        {label}
      </label>
      <textarea
        className={`form-control border-light rounded-3 p-3 ${error && !value?.trim() ? 'is-invalid' : ''}`}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          ...interStyle,
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          resize: 'vertical',
          minHeight: minHeight,
          maxHeight: maxHeight
        }}
      ></textarea>
    </div>
  );
};

FormTextarea.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  rows: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minHeight: PropTypes.string,
  maxHeight: PropTypes.string,
  className: PropTypes.string,
};

export default FormTextarea;

