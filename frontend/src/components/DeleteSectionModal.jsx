import React from "react";
import ModalShell from "./ModalShell";

const DeleteSectionModal = ({ show, onClose, onDelete, selectedSection, deleteLoading }) => {
    return (
        <ModalShell
            show={show}
            onClose={onClose}
            title="Hapus Seksi"
            subtitle="Tindakan penghapusan data seksi"
            theme="danger"
            actionLabel="Ya, Hapus"
            actionLoadingLabel="Menghapus..."
            onAction={onDelete}
            isLoading={deleteLoading}
        >
            <p className="mb-1">Apakah anda yakin ingin menghapus seksi:</p>
            <p className="fw-bold fs-5 text-danger mb-2">
                {selectedSection?.nama}
            </p>
            <div className="alert alert-warning py-2 small mb-0">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Tindakan ini tidak dapat dibatalkan. Semua level di dalam seksi ini juga akan terhapus.
            </div>
        </ModalShell>
    );
};

export default DeleteSectionModal;