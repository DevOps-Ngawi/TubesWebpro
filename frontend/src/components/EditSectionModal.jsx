import React, { useState } from "react";
import ModalShell from "./ModalShell";

const EditSectionModal = ({ show, onClose, onSubmit, editName, setEditName, editLoading }) => {
  const [errors, setErrors] = useState({});

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
    <ModalShell
      show={show}
      onClose={handleClose}
      title="Ubah Section"
      icon="✏️"
      gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
      actionLabel="✓ Simpan Perubahan"
      actionLoadingLabel="Menyimpan..."
      actionClass="btn-warning text-white"
      actionStyle={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", border: "none" }}
      onAction={handleSubmit}
      isLoading={editLoading}
    >
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
    </ModalShell>
  );
};

export default EditSectionModal;
