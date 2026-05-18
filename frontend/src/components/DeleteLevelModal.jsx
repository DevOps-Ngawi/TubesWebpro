import React from "react";

const DeleteLevelModal = ({ show, onClose, onDelete, selectedLevel, isSubmitting }) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop show"></div>

      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Hapus Level</h5>
              <button
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              Apakah anda yakin ingin menghapus level{" "}
              <strong>{selectedLevel?.nama}</strong>?
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-outline-secondary rounded-pill"
                onClick={onClose}
              >
                Batal
              </button>
              <button
                className="btn btn-danger rounded-pill d-flex align-items-center gap-2"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                    Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteLevelModal;
