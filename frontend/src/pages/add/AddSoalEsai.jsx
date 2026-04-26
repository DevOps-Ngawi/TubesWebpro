import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddSoalEsai() {
  const navigate = useNavigate();

  const [pertanyaan, setPertanyaan] = useState('');
  const [kataKunci, setKataKunci] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (!pertanyaan.trim()) {
      setError('Pertanyaan wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const levelId = localStorage.getItem('current_level_id') || '1';
      const token = localStorage.getItem('token');

      const payload = {
        id_level: Number.parseInt(levelId),
        text_soal: pertanyaan,
        kata_kunci: kataKunci,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/soal-esai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate(`/list-soal/${levelId}`, { state: { message: "Soal berhasil ditambahkan!" } });

      } else {
        const result = await response.json();
        setError(result.payload?.message || 'Gagal menyimpan soal.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const interStyle = { fontFamily: "'Inter', sans-serif" };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 overflow-hidden"
      style={{ ...interStyle, backgroundColor: '#f8fafc' }}>

      <div className="card border-0 shadow-sm rounded-4 w-100" style={{ maxWidth: '750px' }}>
        <div className="card-body p-4 p-md-5">

          <div className="d-flex align-items-center mb-4">
            <div
              className="bg-success bg-opacity-10 d-flex align-items-center justify-content-center rounded-4 me-3"
              style={{ width: '50px', height: '50px' }}
            >
              <i className="bi bi-file-earmark-text-fill text-success fs-4"></i>
            </div>
            <div>
              <h1 className="h4 fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                Tambah Soal Esai Baru
              </h1>
              <p className="text-muted small mb-0">Buat pertanyaan esai untuk ujian Anda</p>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary text-uppercase mb-2"
              style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
              PERTANYAAN
            </label>
            <textarea
              className={`form-control border-light rounded-3 p-3 ${error && !pertanyaan ? 'is-invalid' : ''}`}
              rows="3"
              value={pertanyaan}
              onChange={(e) => {
                setPertanyaan(e.target.value);
                if (error) setError('');
              }}
              placeholder="Masukkan soal esai"
              style={{
                ...interStyle,
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                resize: 'vertical',
                minHeight: '100px',
                maxHeight: '180px'
              }}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary text-uppercase mb-2"
              style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
              KATA KUNCI JAWABAN
            </label>
            <textarea
              className="form-control border-light rounded-3 p-3"
              rows="3"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Masukkan kata kunci jawaban"
              style={{
                ...interStyle,
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                resize: 'vertical',
                minHeight: '100px',
                maxHeight: '180px'
              }}
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-2">
            <button
              type="button"
              className="btn btn-light px-4 py-2 fw-semibold rounded-3 border-0"
              onClick={() => navigate(-1)}
              style={{ ...interStyle, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '14px' }}
            >
              Batal
            </button>
            <button
              className="btn btn-success px-4 py-2 fw-semibold rounded-3 shadow-sm border-0"
              onClick={handleSave}
              disabled={loading}
              style={{
                ...interStyle,
                minWidth: '160px',
                backgroundColor: '#198754',
                fontSize: '14px'
              }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : 'Tambah Soal'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}