import React, { useState } from "react";

const EditSectionModal = ({ show, onClose, onSubmit, editName, setEditName, editLoading }) => {
  const [errors, setErrors] = useState({});

  if (!show) return null;

  const validate = () => {
    const newErrors = {};
    if (!editName || editName.trim() === "") {
      newErrors.nama = "Nama section wajib diisi.";
    } else if (editName.trim().length < 3) {
      newErrors.nama = "Nama section minimal 3 karakter.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-lg">

            {/* Header */}
            <div
              className="modal-header border-0 pb-0"
              style={{ background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)", borderRadius: "1rem 1rem 0 0" }}
            >
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-white"
                  style={{ width: 36, height: 36 }}
                >
                  <span style={{ fontSize: 18 }}>✏️</span>
                </div>
                <h5 className="modal-title fw-bold text-white mb-0">Ubah Section</h5>
              </div>
              <button
                className="btn-close btn-close-white"
                onClick={handleClose}
                aria-label="Tutup"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body pt-4 px-4">
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">
                  Nama Section <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control rounded-3 ${errors.nama ? "is-invalid" : ""}`}
                  placeholder="Masukkan nama section"
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (errors.nama) setErrors((prev) => ({ ...prev, nama: "" }));
                  }}
                />
                {errors.nama && (
                  <div className="invalid-feedback d-flex align-items-center gap-1">
                    <span>⚠️</span> {errors.nama}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
              <button
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={handleClose}
                disabled={editLoading}
              >
                Batal
              </button>
              <button
                className="btn btn-warning rounded-pill px-4 fw-semibold text-white"
                onClick={handleSubmit}
                disabled={editLoading}
                style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", border: "none" }}
              >
                {editLoading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...</>
                ) : (
                  "✓ Simpan Perubahan"
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default EditSectionModal;
