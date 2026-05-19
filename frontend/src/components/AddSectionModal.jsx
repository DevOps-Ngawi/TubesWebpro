import React, { useState } from "react";
import ModalShell from "./ModalShell";

const AddSectionModal = ({ show, onClose, onSubmit, addName, setAddName, addLoading }) => {
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!addName || addName.trim() === "") {
            newErrors.nama = "Nama seksi wajib diisi.";
        } else if (addName.trim().length < 3) {
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
            title="Tambah Seksi Baru"
            subtitle="Buat seksi pembelajaran logika baru"
            theme="success"
            icon={<i className="bi bi-folder-plus fs-4"></i>}
            actionLabel="Simpan Seksi"
            actionLoadingLabel="Menyimpan..."
            onAction={handleSubmit}
            isLoading={addLoading}
        >
            <div className="mb-3">
                <label className="form-label fw-semibold text-dark">
                    Nama Seksi <span className="text-danger">*</span>
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