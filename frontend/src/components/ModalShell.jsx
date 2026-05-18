import React from "react";

/**
 * Shared modal shell component untuk menghilangkan duplikasi antar modal.
 * Merender backdrop, wrapper, header (gradient + icon + title), body (children), dan footer (Batal + Action button).
 *
 * @param {Object} props
 * @param {boolean} props.show - Tampilkan modal atau tidak
 * @param {Function} props.onClose - Handler tombol close / Batal
 * @param {string} props.title - Judul modal, e.g. "Tambah Section Baru"
 * @param {string} props.icon - Emoji icon, e.g. "📁"
 * @param {string} props.gradient - CSS gradient untuk header, e.g. "linear-gradient(135deg, #198754 0%, #20c997 100%)"
 * @param {string} props.actionLabel - Label tombol aksi, e.g. "✓ Simpan Section"
 * @param {string} [props.actionLoadingLabel] - Label saat loading, e.g. "Menyimpan..."
 * @param {string} props.actionClass - CSS class tombol aksi, e.g. "btn-success"
 * @param {Object} [props.actionStyle] - Inline style tombol aksi
 * @param {Function} props.onAction - Handler tombol aksi
 * @param {boolean} props.isLoading - Disable buttons saat loading
 * @param {React.ReactNode} props.children - Konten body modal
 */
const ModalShell = ({
  show,
  onClose,
  title,
  icon,
  gradient,
  actionLabel,
  actionLoadingLabel = "Memproses...",
  actionClass = "btn-success",
  actionStyle,
  onAction,
  isLoading = false,
  children
}) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-lg">

            {/* Header */}
            <div
              className="modal-header border-0 pb-0"
              style={{ background: gradient, borderRadius: "1rem 1rem 0 0" }}
            >
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-white"
                  style={{ width: 36, height: 36 }}
                >
                  <span style={{ fontSize: 18 }}>{icon}</span>
                </div>
                <h5 className="modal-title fw-bold text-white mb-0">{title}</h5>
              </div>
              <button
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Tutup"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body pt-4 px-4">
              {children}
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
              <button
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={onClose}
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                className={`btn ${actionClass} rounded-pill px-4 fw-semibold`}
                onClick={onAction}
                disabled={isLoading}
                style={actionStyle}
              >
                {isLoading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>{actionLoadingLabel}</>
                ) : (
                  actionLabel
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ModalShell;
