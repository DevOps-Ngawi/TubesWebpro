import React, { useState } from "react";

const AddLevelModal = ({
  show,
  onClose,
  onSubmit,
  newLevelName,
  setNewLevelName,
  newLevelDescription,
  setNewLevelDescription,
  newLevelOrder,
  setNewLevelOrder,
  sections,
  selectedSectionId,
  setSelectedSectionId,
}) => {
  const [errors, setErrors] = useState({});

  if (!show) return null;

  // Validasi input sebelum submit
  const validate = () => {
    const newErrors = {};
    if (!newLevelName || newLevelName.trim() === "") {
      newErrors.nama = "Nama level wajib diisi.";
    } else if (newLevelName.trim().length < 3) {
      newErrors.nama = "Nama level minimal 3 karakter.";
    }
    if (!selectedSectionId || selectedSectionId === "") {
      newErrors.section = "Section wajib dipilih.";
    }
    if (newLevelOrder !== "" && (Number.isNaN(newLevelOrder) || Number(newLevelOrder) < 1)) {
      newErrors.order = "Urutan level harus berupa angka positif.";
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
              style={{ background: "linear-gradient(135deg, #198754 0%, #20c997 100%)", borderRadius: "1rem 1rem 0 0" }}
            >
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-white"
                  style={{ width: 36, height: 36 }}
                >
                  <span style={{ fontSize: 18 }}>📚</span>
                </div>
                <h5 className="modal-title fw-bold text-white mb-0">Tambah Level Baru</h5>
              </div>
              <button
                className="btn-close btn-close-white"
                onClick={handleClose}
                aria-label="Tutup"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body pt-4 px-4">

              {/* Nama Level */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">
                  Nama Level <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control rounded-3 ${errors.nama ? "is-invalid" : ""}`}
                  placeholder="Contoh: Level Pemula"
                  value={newLevelName}
                  onChange={(e) => {
                    setNewLevelName(e.target.value);
                    if (errors.nama) setErrors((prev) => ({ ...prev, nama: "" }));
                  }}
                />
                {errors.nama && (
                  <div className="invalid-feedback d-flex align-items-center gap-1">
                    <span>⚠️</span> {errors.nama}
                  </div>
                )}
              </div>

              {/* Deskripsi Level (field baru) */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">
                  Deskripsi Level
                  <span className="text-muted fw-normal ms-1" style={{ fontSize: "0.8rem" }}>(opsional)</span>
                </label>
                <textarea
                  className="form-control rounded-3"
                  placeholder="Jelaskan tujuan atau konten dari level ini..."
                  rows={3}
                  value={newLevelDescription}
                  onChange={(e) => setNewLevelDescription(e.target.value)}
                  style={{ resize: "none" }}
                />
                <div className="form-text text-muted" style={{ fontSize: "0.75rem" }}>
                  {(newLevelDescription || "").length}/200 karakter
                </div>
              </div>

              {/* Urutan Level (field baru) */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">
                  Urutan Level
                  <span className="text-muted fw-normal ms-1" style={{ fontSize: "0.8rem" }}>(opsional)</span>
                </label>
                <input
                  type="number"
                  className={`form-control rounded-3 ${errors.order ? "is-invalid" : ""}`}
                  placeholder="Contoh: 1"
                  min="1"
                  value={newLevelOrder}
                  onChange={(e) => {
                    setNewLevelOrder(e.target.value);
                    if (errors.order) setErrors((prev) => ({ ...prev, order: "" }));
                  }}
                />
                {errors.order && (
                  <div className="invalid-feedback d-flex align-items-center gap-1">
                    <span>⚠️</span> {errors.order}
                  </div>
                )}
                <div className="form-text text-muted" style={{ fontSize: "0.75rem" }}>
                  Menentukan urutan tampil level dalam section.
                </div>
              </div>

              {/* Section */}
              <div className="mb-2">
                <label className="form-label fw-semibold text-dark">
                  Section <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select rounded-3 ${errors.section ? "is-invalid" : ""}`}
                  value={selectedSectionId}
                  onChange={(e) => {
                    setSelectedSectionId(e.target.value);
                    if (errors.section) setErrors((prev) => ({ ...prev, section: "" }));
                  }}
                >
                  <option value="">-- Pilih Section --</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.nama}
                    </option>
                  ))}
                </select>
                {errors.section && (
                  <div className="invalid-feedback d-flex align-items-center gap-1">
                    <span>⚠️</span> {errors.section}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
              <button
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={handleClose}
              >
                Batal
              </button>
              <button
                className="btn btn-success rounded-pill px-4 fw-semibold"
                onClick={handleSubmit}
                style={{ background: "linear-gradient(135deg, #198754, #20c997)", border: "none" }}
              >
                ✓ Simpan Level
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AddLevelModal;