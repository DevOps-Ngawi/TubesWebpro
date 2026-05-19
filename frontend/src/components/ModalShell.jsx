import React from "react";

/**
 * Shared modal shell component untuk menghilangkan duplikasi antar modal.
 * Merender backdrop, wrapper, header (Mockup Baru dengan Icon Box + Title + Subtitle), body (children), dan footer (Batal + Action button).
 *
 * @param {Object} props
 * @param {boolean} props.show - Tampilkan modal atau tidak
 * @param {Function} props.onClose - Handler tombol close / Batal
 * @param {string} props.title - Judul modal, e.g. "Tambah Section Baru"
 * @param {string} [props.subtitle] - Deskripsi tambahan kecil di bawah judul
 * @param {string} [props.theme] - Tema modal: "success" (green), "warning" (yellow), "primary" (blue)
 * @param {string} [props.icon] - Icon khusus jika tidak ingin menggunakan default theme icon
 * @param {string} props.actionLabel - Label tombol aksi, e.g. "✓ Simpan Section"
 * @param {string} [props.actionLoadingLabel] - Label saat loading, e.g. "Menyimpan..."
 * @param {string} props.actionClass - CSS class tombol aksi, e.g. "btn-success"
 * @param {Object} [props.actionStyle] - Inline style tombol aksi
 * @param {Function} props.onAction - Handler tombol aksi
 * @param {boolean} props.isLoading - Disable buttons saat loading
 * @param {string} [props.size] - Ukuran modal: "sm", "lg", "xl"
 * @param {string} [props.cancelLabel] - Label tombol batal, e.g. "Batal"
 * @param {Function} [props.onCancel] - Handler khusus tombol batal
 * @param {string} [props.cancelClass] - CSS class tombol batal
 * @param {boolean} [props.showCancel] - Tampilkan tombol batal atau tidak
 * @param {React.ReactNode} props.children - Konten body modal
 */
const ModalShell = ({
    show,
    onClose,
    title,
    subtitle = "",
    theme = "primary", // success, warning, primary
    icon = null,
    actionLabel,
    actionLoadingLabel = "Memproses...",
    actionClass = "",
    actionStyle,
    onAction,
    isLoading = false,
    size = "",
    cancelLabel = "Batal",
    onCancel = null,
    cancelClass = "btn-light text-dark border-0",
    cancelStyle = { backgroundColor: '#e2e8f0', color: '#475569' },
    showCancel = true,
    children
}) => {
    if (!show) return null;

    const handleCancelClick = onCancel || onClose;

    // Define colors & icons based on mockups exactly
    let themeBgColor = "#e8f0fe"; // soft blue
    let themeTextColor = "#1a73e8"; // blue
    let defaultIcon = <i className="bi bi-info-circle-fill fs-4"></i>;
    let computedActionClass = "btn btn-primary";
    let computedActionStyle = {};

    if (theme === "success") {
        themeBgColor = "#e6f4ea"; // soft green
        themeTextColor = "#137333"; // deep green
        defaultIcon = <i className="bi bi-file-earmark-plus-fill fs-4"></i>;
        computedActionClass = "btn btn-success";
    } else if (theme === "warning") {
        themeBgColor = "#fef3c7"; // soft yellow
        themeTextColor = "#b45309"; // deep gold/yellow
        defaultIcon = <i className="bi bi-pencil-square fs-4"></i>;
        computedActionClass = "btn text-white";
        computedActionStyle = { backgroundColor: "#ffb300", borderColor: "#ffb300" };
    } else if (theme === "primary") {
        themeBgColor = "#e8f0fe"; // soft blue
        themeTextColor = "#1a73e8"; // deep blue
        defaultIcon = <i className="bi bi-info-circle-fill fs-4"></i>;
        computedActionClass = "btn btn-primary";
    } else if (theme === "danger") {
        themeBgColor = "#f8d7da"; // soft red
        themeTextColor = "#842029"; // deep red
        defaultIcon = <i className="bi bi-exclamation-triangle-fill fs-4"></i>;
        computedActionClass = "btn btn-danger";
    }

    const finalIcon = icon || defaultIcon;
    const finalActionClass = actionClass || computedActionClass;
    const finalActionStyle = { ...computedActionStyle, ...actionStyle };

    return (
        <>
            <div className="modal-backdrop show" style={{ backgroundColor: "rgba(15, 23, 42, 0.3)", backdropFilter: "blur(4px)" }}></div>
            <div className="modal d-block" tabIndex="-1">
                <div className={`modal-dialog modal-dialog-centered ${size ? `modal-${size}` : ""}`}>
                    <div className="modal-content rounded-4 border-0 shadow-lg p-3 bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>

                        {/* Header Mockup Premium */}
                        <div className="modal-header border-0 pb-0 pt-3 px-3 bg-white d-flex justify-content-between align-items-start">
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
                                    style={{
                                        width: 52,
                                        height: 52,
                                        backgroundColor: themeBgColor,
                                        color: themeTextColor,
                                        flexShrink: 0
                                    }}
                                >
                                    {finalIcon}
                                </div>
                                <div className="text-start">
                                    <h4 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: '1.2rem', letterSpacing: '-0.02em' }}>{title}</h4>
                                    {subtitle && <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.825rem' }}>{subtitle}</p>}
                                </div>
                            </div>
                            <button
                                className="btn-close ms-2"
                                onClick={onClose}
                                aria-label="Tutup"
                                style={{ boxShadow: 'none' }}
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body pt-4 px-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {children}
                        </div>

                        {/* Footer Mockup Premium */}
                        <div className="modal-footer border-0 px-3 pb-3 pt-2 gap-2 d-flex justify-content-end">
                            {showCancel && (
                                <button
                                    className={`${cancelClass} rounded-3 px-4 py-2 fw-semibold shadow-sm`}
                                    onClick={handleCancelClick}
                                    disabled={isLoading}
                                    style={{ fontSize: '14px', transition: 'all 0.2s', ...cancelStyle }}
                                >
                                    {cancelLabel}
                                </button>
                            )}
                            <button
                                className={`${finalActionClass} rounded-3 px-4 py-2 fw-semibold shadow-sm`}
                                onClick={onAction}
                                disabled={isLoading}
                                style={{ ...finalActionStyle, fontSize: '14px', transition: 'all 0.2s' }}
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