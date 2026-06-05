import React from "react";
import ModalShell from "./ModalShell";

const DeleteLevelModal = ({ show, onClose, onDelete, selectedLevel, isSubmitting }) => {
  return (
    <ModalShell
      show={show}
      onClose={onClose}
      title="Hapus Level"
      subtitle="Tindakan penghapusan data level"
      theme="danger"
      actionLabel="Ya, Hapus"
      actionLoadingLabel="Menghapus..."
      onAction={onDelete}
      isLoading={isSubmitting}
    >
      <p className="mb-1">Apakah anda yakin ingin menghapus level:</p>
      <p className="fw-bold fs-5 text-danger mb-2">
        {selectedLevel?.nama}
      </p>
      <div className="alert alert-warning py-2 small mb-0">
        <i className="bi bi-exclamation-triangle me-1"></i>
        Tindakan ini tidak dapat dibatalkan. Semua soal di dalam level ini juga akan terhapus.
      </div>
    </ModalShell>
  );
};

export default DeleteLevelModal;
