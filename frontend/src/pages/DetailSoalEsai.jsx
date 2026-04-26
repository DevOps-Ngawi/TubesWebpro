import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function DetailSoalEsai() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3030/api/soal-esai/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.payload?.datas) {
          setData(result.payload.datas);
        } else {
          setError("Data tidak ditemukan.");
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const interStyle = { fontFamily: "'Inter', sans-serif" };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={interStyle}>
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-3 fw-medium text-secondary">Memuat detil soal...</span>
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
              <i className="bi bi-info-circle-fill text-primary fs-4"></i>
            </div>
            <div>
              <h1 className="h4 fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                Detil Soal Esai
              </h1>
              <p className="text-muted small mb-0">Informasi lengkap mengenai pertanyaan esai</p>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary text-uppercase mb-2" 
                   style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
              PERTANYAAN
            </label>
            <textarea
              className="form-control border-light rounded-3 p-3"
              rows="3" 
              value={data?.text_soal || ''}
              readOnly
              style={{ 
                ...interStyle,
                backgroundColor: '#f1f5f9', 
                border: '1px solid #e2e8f0', 
                resize: 'none',
                minHeight: '100px',
                cursor: 'default'
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
              value={data?.kata_kunci || 'Tidak ada kata kunci'}
              readOnly
              style={{ 
                ...interStyle,
                backgroundColor: '#f1f5f9', 
                border: '1px solid #e2e8f0', 
                resize: 'none',
                minHeight: '100px',
                cursor: 'default'
              }}
            ></textarea>
            
          </div>

          {error && <div className="alert alert-danger py-2 small border-0 mb-4">{error}</div>}

          <div className="d-flex justify-content-end gap-2 mt-2">
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
  );
}