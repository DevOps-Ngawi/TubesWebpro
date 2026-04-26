import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './styles/EditSoalPG.css'

export default function DetailSoalPG() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [soal, setSoal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSoal = async () => {
      setError(null)
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3030/api/soals-pg/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json()

        if (data.payload?.datas) {
          setSoal(data.payload.datas)
          setError(null)
        } else {
          setError("Soal tidak ditemukan")
        }
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchSoal()
  }, [id])

  const interStyle = { fontFamily: "'Inter', sans-serif" };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={interStyle}>
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-3 fw-medium text-secondary">Memuat detail soal...</span>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 overflow-hidden"
      style={{ ...interStyle, backgroundColor: '#f8fafc' }}>

      <div className="card border-0 shadow-sm rounded-4 w-100" style={{ maxWidth: '750px' }}>
        <div className="card-body p-4 p-md-5">

          <div className="d-flex align-items-center mb-4">
            <div
              className="bg-primary bg-opacity-10 d-flex align-items-center justify-content-center rounded-4 me-3"
              style={{ width: '50px', height: '50px' }}
            >
              <i className="bi bi-list-task text-primary fs-4"></i>
            </div>
            <div>
              <h1 className="h4 fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                Detail Soal Pilihan Ganda
              </h1>
              <p className="text-muted small mb-0">Informasi lengkap mengenai pertanyaan pilihan ganda</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small text-secondary text-uppercase mb-2"
              style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
              PERTANYAAN
            </label>
            <div
              className="form-control border-light rounded-3 p-3 text-wrap"
              style={{
                ...interStyle,
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                minHeight: '80px',
                cursor: 'default'
              }}
            >
              {soal?.text_soal}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary text-uppercase mb-2"
              style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
              OPSI JAWABAN
            </label>
            <div className="d-flex flex-column gap-2">
              {soal?.opsis?.map((o, index) => (
                <div
                  key={o.id}
                  className={`d-flex align-items-center p-3 rounded-3 border ${o.is_correct ? 'bg-success bg-opacity-10 border-success' : 'bg-white border-light'}`}
                  style={{ transition: 'all 0.2s' }}
                >
                  <div
                    className={`d-flex align-items-center justify-content-center rounded-circle me-3 fw-bold ${o.is_correct ? 'bg-success text-white' : 'bg-light text-secondary'}`}
                    style={{ width: '32px', height: '32px', fontSize: '14px' }}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className={`flex-grow-1 ${o.is_correct ? 'text-success fw-medium' : 'text-dark'}`}>
                    {o.text_opsi}
                  </div>
                  {o.is_correct && (
                    <span className="badge bg-success rounded-pill px-3 py-2 ms-2">
                      <i className="bi bi-check-lg me-1"></i>
                      Benar
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && <div className="alert alert-danger py-2 small border-0 mb-4">{error}</div>}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-light px-4 py-2 fw-semibold rounded-3 border-0"
              onClick={() => navigate(-1)}
              style={{ ...interStyle, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '14px' }}
            >
              Kembali
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
