import React from "react";
import ModalShell from "./ModalShell";

const UpdateLevelModal = ({
  show,
  onClose,
  onSubmit,
  updateLevelName,
  setUpdateLevelName,
  sections,
  updateSectionId,
  setUpdateSectionId,
  isSubmitting,
}) => {
  return (
    <ModalShell
      show={show}
      onClose={onClose}
      title="Ubah Level"
      subtitle="Perbarui informasi data level pembelajaran"
      theme="warning"
      icon={<i className="bi bi-pencil-square fs-4"></i>}
      actionLabel="Simpan Perubahan"
      actionLoadingLabel="Menyimpan..."
      onAction={onSubmit}
      isLoading={isSubmitting}
    >
      <div className="mb-3">
        <label className="form-label fw-semibold text-dark">Nama Level</label>
        <input
          type="text"
          className="form-control rounded-3"
          placeholder="Masukkan nama level"
          value={updateLevelName}
          onChange={(e) => setUpdateLevelName(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold text-dark">Seksi</label>
        <select
          className="form-select rounded-3"
          value={updateSectionId}
          onChange={(e) => setUpdateSectionId(e.target.value)}
        >
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.nama}
            </option>
          ))}
        </select>
      </div>
    </ModalShell>
  );
};

export default UpdateLevelModal;
