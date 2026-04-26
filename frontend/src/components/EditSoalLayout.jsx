import React from 'react';

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
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={interStyle}>
        <div className="spinner-border text-warning" role="status"></div>
        <span className="ms-3 fw-medium">Memuat data soal...</span>
      </div>
    );
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

          {error && <div className="alert alert-danger py-2 small border-0 mb-4">{error}</div>}

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
              onClick={onSave}
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
              ) : 'Ubah Soal'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
