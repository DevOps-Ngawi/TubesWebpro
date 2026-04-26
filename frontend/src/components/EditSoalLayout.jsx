import React from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner';
import FormFooter from './FormFooter';

const interStyle = { fontFamily: "'Inter', sans-serif" };

/**
 * Shared layout component untuk halaman edit soal (Esai & PG).
 * Merender loading state, page wrapper, card, header, error alert, dan action buttons.
 *
 * @param {Object} props
 * @param {string} props.title - Judul halaman, e.g. "Ubah Soal Esai"
 * @param {string} props.subtitle - Subjudul, e.g. "Ubah pertanyaan esai"
 * @param {boolean} props.loading - Apakah sedang memuat data
 * @param {boolean} props.isSaving - Apakah sedang menyimpan
 * @param {string} props.error - Pesan error (kosong jika tidak ada error)
 * @param {Function} props.onSave - Handler saat tombol "Ubah Soal" diklik
 * @param {Function} props.onCancel - Handler saat tombol "Batal" diklik
 * @param {React.ReactNode} props.children - Form fields spesifik per tipe soal
 */
export default function EditSoalLayout({ title, subtitle, loading, isSaving, error, onSave, onCancel, children }) {
  if (loading) {
    return <LoadingSpinner color="warning" message="Memuat data soal..." />;
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 overflow-hidden"
         style={{ ...interStyle, backgroundColor: '#f8fafc' }}>

      <div className="card border-0 shadow-sm rounded-4 w-100" style={{ maxWidth: '750px' }}>
        <div className="card-body p-4 p-md-5">

          <div className="d-flex align-items-center mb-4">
            <div
              className="bg-warning bg-opacity-10 d-flex align-items-center justify-content-center rounded-4 me-3"
              style={{ width: '50px', height: '50px' }}
            >
              <i className="bi bi-pencil-square text-warning fs-4"></i>
            </div>
            <div>
              <h1 className="h4 fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                {title}
              </h1>
              <p className="text-muted small mb-0">{subtitle}</p>
            </div>
          </div>

          {children}

          {error && (
            <div className="alert alert-danger py-2 small border-0 mb-4 rounded-3 d-flex align-items-center">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {error}
            </div>
          )}

          <FormFooter 
            onCancel={onCancel}
            onSubmit={onSave}
            isSaving={isSaving}
          />

        </div>
      </div>
    </div>
  );
}

EditSoalLayout.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  loading: PropTypes.bool,
  isSaving: PropTypes.bool,
  error: PropTypes.string,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  children: PropTypes.node,
};
