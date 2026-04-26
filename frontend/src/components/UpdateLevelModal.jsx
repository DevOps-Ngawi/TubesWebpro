import React from "react";

const UpdateLevelModal = ({
  show,
  onClose,
  onSubmit,
  updateLevelName,
  setUpdateLevelName,
  sections,
  updateSectionId,
  setUpdateSectionId,
}) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop show"></div>

      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Ubah Level</h5>
              <button
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Nama Level</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Masukkan nama level"
                  value={updateLevelName}
                  onChange={(e) => setUpdateLevelName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Section</label>
                <select
                  className="form-select"
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
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-outline-secondary rounded-pill"
                onClick={onClose}
              >
                Batal
              </button>
              <button
                className="btn btn-success rounded-pill"
                onClick={onSubmit}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateLevelModal;
