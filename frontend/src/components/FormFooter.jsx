import React from 'react';
import PropTypes from 'prop-types';

const FormFooter = ({ onCancel, onSubmit, isSaving, submitLabel = "Ubah Soal" }) => {
  const interStyle = { fontFamily: "'Inter', sans-serif" };
  
  return (
    <div className="d-flex justify-content-end gap-2 mt-2">
      <button
        type="button"
        className="btn btn-light px-4 py-2 fw-semibold rounded-3 border-0"
        onClick={onCancel}
        style={{ ...interStyle, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '14px' }}
      >
        Batal
      </button>
      <button
        className="btn btn-warning px-4 py-2 fw-semibold rounded-3 shadow-sm border-0 text-white"
        onClick={onSubmit}
        disabled={isSaving}
        style={{
          ...interStyle,
          minWidth: '160px',
          backgroundColor: '#ffc107',
          fontSize: '14px'
        }}
      >
        {isSaving ? (
          <span className="spinner-border spinner-border-sm me-2"></span>
        ) : submitLabel}
      </button>
    </div>
  );
};

FormFooter.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  isSaving: PropTypes.bool,
  submitLabel: PropTypes.string,
};

export default FormFooter;

