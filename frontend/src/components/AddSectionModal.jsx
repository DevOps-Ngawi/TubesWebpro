import React, { useState } from "react";
import ModalShell from "./ModalShell";

const AddSectionModal = ({ show, onClose, onSubmit, addName, setAddName, addLoading }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!addName || addName.trim() === "") {
      newErrors.nama = "Nama section wajib diisi.";
    } else if (addName.trim().length < 3) {
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
      title="Tambah Section Baru"
      icon="📁"
      gradient="linear-gradient(135deg, #198754 0%, #20c997 100%)"
      actionLabel="✓ Simpan Section"
      actionLoadingLabel="Menyimpan..."
      actionClass="btn-success"
      actionStyle={{ background: "linear-gradient(135deg, #198754, #20c997)", border: "none" }}
      onAction={handleSubmit}
      isLoading={addLoading}
    >
      <div className="mb-3">
        <label className="form-label fw-semibold text-dark">
          Nama Section <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={`form-control rounded-3 ${errors.nama ? "is-invalid" : ""}`}
          placeholder="Contoh: Logika Dasar"
          value={addName}
          onChange={(e) => {
            setAddName(e.target.value);
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

export default AddSectionModal;
