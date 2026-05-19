import React, { useState } from "react";
import ModalShell from "./ModalShell";

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
  isSubmitting,
}) => {
  const [errors, setErrors] = useState({});

  // Validasi input sebelum submit
  const validate = () => {
    const newErrors = {};
    if (!newLevelName || newLevelName.trim() === "") {
      newErrors.nama = "Nama level wajib diisi.";
    } else if (newLevelName.trim().length < 3) {
      newErrors.nama = "Nama level minimal 3 karakter.";
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
    <ModalShell
      show={show}
      onClose={handleClose}
      title="Tambah Level Baru"
      subtitle="Buat level pembelajaran logika baru"
      theme="success"
      icon={<i className="bi bi-journal-plus fs-4"></i>}
      actionLabel="Simpan Level"
      actionLoadingLabel="Menyimpan..."
      onAction={handleSubmit}
      isLoading={isSubmitting}
    >
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

      {/* Deskripsi Level */}
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

      {/* Urutan Level */}
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
          Menentukan urutan tampil level dalam seksi.
        </div>
      </div>
    </ModalShell>
  );
};

export default AddLevelModal;