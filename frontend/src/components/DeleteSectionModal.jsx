import React from "react";

const DeleteSectionModal = ({ show, onClose, onDelete, selectedSection, deleteLoading }) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-lg">

            {/* Header */}
            <div
              className="modal-header border-0 pb-0"
              style={{ background: "linear-gradient(135deg, #dc3545 0%, #e74c5e 100%)", borderRadius: "1rem 1rem 0 0" }}
            >
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-white"
                  style={{ width: 36, height: 36 }}
                >
                  <span style={{ fontSize: 18 }}>🗑️</span>
                </div>
                <h5 className="modal-title fw-bold text-white mb-0">Hapus Section</h5>
              </div>
              <button
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Tutup"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body pt-4 px-4">
              <p className="mb-1">Apakah anda yakin ingin menghapus section:</p>
              <p className="fw-bold fs-5 text-danger mb-2">
                {selectedSection?.nama}
              </p>
              <div className="alert alert-warning py-2 small mb-0">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Tindakan ini tidak dapat dibatalkan. Semua level di dalam section ini juga akan terhapus.
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
              <button
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={onClose}
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button
                className="btn btn-danger rounded-pill px-4 fw-semibold"
                onClick={onDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Menghapus...</>
                ) : (
                  "🗑️ Ya, Hapus"
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteSectionModal;
