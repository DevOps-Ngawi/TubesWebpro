import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./styles/ReviewAttempt.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import EditEsaiModal from "../components/EditJawabanEsaiModal";

export default function DetailAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ skor: "", feedback: "" });
  const [isSaving, setIsSaving] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditClick = (jawaban) => {
    setEditingId(jawaban.id);
    setEditForm({
      skor: jawaban.skor,
      feedback: jawaban.feedback || "",
    });
    setShowEditModal(true);
  };



  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      setIsSaving(true);
      if (!editForm.skor || !editForm.feedback) {
        throw new Error("Skor dan Feedback wajib diisi");
      }
      if (Number(editForm.skor) < 0 || Number(editForm.skor) > 1) {
        throw new Error("Skor tidak valid, isi dalam rentang 0.0 - 1.0");
      }
      const token = localStorage.getItem("token");
      const idAdmin = localStorage.getItem("id");
      const response = await fetch(
        `http://localhost:3030/api/jawaban-esais/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            skor: Number(editForm.skor),
            feedback: editForm.feedback,
            idAdmin: Number(idAdmin),
          }),
        }
      );

      const responseJson = await response.json();

      if (responseJson?.payload?.statusCode !== 200) {
        throw new Error(responseJson.payload.message);
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Berhasil mengubah skor`,
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        setShowEditModal(false);
        window.location.reload();
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: `${err.message}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fetchAttemptDetail = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3030/api/attempts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(
          `Gagal memuat detil attempt: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log("Detil attempt data:", data);
      const attemptData = data.payload?.datas;
      setAttempt(attemptData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAttemptDetail();
  }, [fetchAttemptDetail]);

  const handleBack = () => {
    navigate("/review-attempt");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Memuat detil attempt...</p>
        </div>
      </>
    );
  }

  if (error || !attempt) {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <div
            className="alert alert-danger d-flex align-items-center"
            role="alert"
          >
            <div>Error: {error || "Data tidak ditemukan"}</div>
          </div>
          <button className="btn btn-outline-secondary" onClick={handleBack}>
            &larr; Kembali
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-5 mb-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-1">Detil Attempt</h1>
            <p className="text-muted">Rincian jawaban dan skor siswa</p>
          </div>
          <button
            className="btn btn-outline-secondary rounded-pill px-4"
            onClick={handleBack}
          >
            &larr; Kembali
          </button>
        </div>

        {/* Info Card */}
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold text-primary mb-4">Informasi Umum</h5>
            <div className="row g-3">
              <div className="col-md-3">
                <small className="text-muted d-block uppercase-label">
                  Username
                </small>
                <span className="fw-bold fs-5">
                  {attempt.pelajars?.username}
                </span>
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block uppercase-label">
                  Level
                </small>
                <span className="fw-medium">{attempt.levels?.nama}</span>
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block uppercase-label">
                  Section
                </small>
                <span className="fw-medium">
                  {attempt.levels?.sections?.nama}
                </span>
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block uppercase-label">
                  Skor Akhir
                </small>
                <span
                  className={`fw-bold fs-4 ${attempt.skor >= 75 ? "text-success" : "text-danger"
                    }`}
                >
                  {Number(attempt.skor).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold text-primary mb-4">Daftar Pertanyaan</h5>

            {attempt.jawaban_pgs &&
              attempt.jawaban_pgs.map((jawaban, index) => (
                <div
                  key={`pg-${jawaban.id}`}
                  className="mb-4 p-3 border rounded-3 bg-light-subtle position-relative"
                >
                  <span className="position-absolute top-0 start-0 badge bg-primary m-3 rounded-pill">
                    Soal {index + 1}
                  </span>
                  <div className="mt-4 pt-2">
                    <h6 className="fw-bold mb-3">
                      {jawaban.opsis?.soals?.text_soal}
                    </h6>

                    <div className="bg-white p-3 border rounded mb-3 d-flex gap-2">
                      <span className="text-dark fw-medium text-nowrap">
                        Jawaban Siswa:
                      </span>
                      <span
                        className={`fw-medium ${jawaban.opsis?.is_correct
                            ? "text-success"
                            : "text-danger"
                          }`}
                      >
                        {jawaban.opsis?.text_opsi}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small">Status:</span>
                      {jawaban.opsis?.is_correct ? (
                        <span className="badge bg-success-subtle text-success border border-success d-flex align-items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            fill="currentColor"
                            className="bi bi-check-circle-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                          </svg>
                          Benar
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger d-flex align-items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            fill="currentColor"
                            className="bi bi-x-circle-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
                          </svg>
                          Salah
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {attempt.jawaban_esais &&
              attempt.jawaban_esais.map((jawaban, index) => {
                return (
                  <div
                    key={`esai-${jawaban.id}`}
                    className="mb-4 p-3 border rounded-3"
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex gap-2">
                        <span className="badge bg-primary rounded-pill">
                          Soal{" "}
                          {(attempt.jawaban_pgs
                            ? attempt.jawaban_pgs.length
                            : 0) +
                            index +
                            1}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {jawaban.admins && (
                          <small className="text-muted">
                            Dinilai oleh:{" "}
                            <span className="fw-bold">
                              {jawaban.admins.nama}
                            </span>
                          </small>
                        )}
                        {
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={() => handleEditClick(jawaban)}
                          >
                            <i className="bi bi-pencil-fill"></i>
                            Ubah
                          </button>
                        }
                      </div>
                    </div>

                    <h6 className="fw-bold mb-3">{jawaban.soals?.text_soal}</h6>

                    <div className="bg-white p-3 border rounded mb-3 d-flex gap-2">
                      <span className="text-dark fw-medium text-nowrap">
                        Jawaban Siswa:
                      </span>
                      <span className="text-dark">
                        {jawaban.text_jawaban || jawaban.text_jawaban_esai}
                      </span>
                    </div>

                    {
                      <>
                        {jawaban.feedback && (
                          <div className="bg-warning-subtle p-3 border border-warning rounded mb-3">
                            <small className="text-warning-emphasis fw-bold d-block mb-1">
                              {jawaban.id_admin === null ? `Feedback AI` : `Feedback Admin`}
                            </small>
                            <p className="mb-0 text-dark small">
                              {jawaban.feedback}
                            </p>
                          </div>
                        )}

                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted small">Skor:</span>
                          <span className="badge bg-secondary rounded-pill">
                            {jawaban.skor}
                          </span>
                        </div>
                      </>
                    }
                  </div>
                );
              })}

            {!attempt.jawaban_pgs?.length && !attempt.jawaban_esais?.length && (
              <p className="text-muted text-center py-4">
                Belum ada jawaban yang direkam.
              </p>
            )}
          </div>
        </div>
      </div>
      <EditEsaiModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSaveEdit}
        editForm={editForm}
        setEditForm={setEditForm}
        isSaving={isSaving}
      />
    </>
  );
}
