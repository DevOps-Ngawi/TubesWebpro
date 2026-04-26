import React from "react";

const EditEsaiModal = ({
  show,
  onClose,
  onSubmit,
  editForm,
  setEditForm,
  isSaving,
}) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop show"></div>

      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Edit Penilaian Esai</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Skor (0 - 1)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  className="form-control"
                  value={editForm.skor}
                  onChange={(e) =>
                    setEditForm({ ...editForm, skor: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Feedback AI</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={editForm.feedback}
                  onChange={(e) =>
                    setEditForm({ ...editForm, feedback: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-outline-secondary rounded-pill"
                onClick={onClose}
                disabled={isSaving}
              >
                Batal
              </button>

              <button
                className="btn btn-primary rounded-pill"
                onClick={onSubmit}
                disabled={isSaving}
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditEsaiModal;
