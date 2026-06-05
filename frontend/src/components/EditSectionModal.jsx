import React, { useState } from "react";
import ModalShell from "./ModalShell";

const EditSectionModal = ({ show, onClose, onSubmit, editName, setEditName, editLoading }) => {
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!editName || editName.trim() === "") {
            newErrors.nama = "Nama seksi wajib diisi.";
        } else if (editName.trim().length < 3) {
            newErrors.nama = "Nama seksi minimal 3 karakter.";
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
            title="Ubah Seksi"
            subtitle="Ubah informasi nama seksi pembelajaran"
            theme="warning"
            icon={<i className="bi bi-pencil-square fs-4"></i>}
            actionLabel="Simpan Perubahan"
            actionLoadingLabel="Menyimpan..."
            onAction={handleSubmit}
            isLoading={editLoading}
        >
            <div className="mb-3">
                <label className="form-label fw-semibold text-dark">
                    Nama Seksi <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className={`form-control rounded-3 ${errors.nama ? "is-invalid" : ""}`}
                    placeholder="Masukkan nama seksi"
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