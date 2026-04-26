import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import EditPageLayout from '../../components/EditPageLayout';
import FormTextarea from '../../components/FormTextarea';
import FormFooter from '../../components/FormFooter';

export default function EditSoalPG() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pertanyaan, setPertanyaan] = useState('');
  const [opsi, setOpsi] = useState([
    { text_opsi: '', is_correct: false },
    { text_opsi: '', is_correct: false }
  ]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [levelId, setLevelId] = useState(null);

  useEffect(() => {
    const fetchSoal = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3030/api/soals-pg/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.payload?.datas) {
          setPertanyaan(data.payload.datas.text_soal);
          setOpsi(data.payload.datas.opsis || []);
          setLevelId(data.payload.datas.id_level);
        } else {
          setError('Data soal tidak ditemukan.');
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchSoal();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleOpsiChange = (index, value) => {
    const newOpsi = [...opsi];
    newOpsi[index].text_opsi = value;
    setOpsi(newOpsi);
    if (error) setError('');
  };

  const handleCorrectAnswerChange = (index) => {
    const newOpsi = opsi.map((o, i) => ({
      ...o,
      is_correct: i === index
    }));
    setOpsi(newOpsi);
    if (error) setError('');
  };

  const handleAddOpsi = () => {
    setOpsi([...opsi, { text_opsi: '', is_correct: false }]);
  };

  const handleRemoveOpsi = (index) => {
    if (opsi.length > 2) {
      setOpsi(opsi.filter((_, i) => i !== index));
    } else {
      setError('Minimal harus ada 2 opsi jawaban.');
    }
  };

  const handleSave = async () => {
    setError('');

    if (!pertanyaan.trim()) {
      setError('Pertanyaan wajib diisi.');
      return;
    }

    if (opsi.some(o => !o.text_opsi.trim())) {
      setError('Semua opsi jawaban harus diisi.');
      return;
    }

    if (!opsi.some(o => o.is_correct)) {
      setError('Pilih salah satu jawaban yang benar.');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3030/api/soals-pg/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text_soal: pertanyaan,
          opsi
        })
      });

      const data = await response.json();

      if (response.ok) {
        navigate(`/list-soal/${levelId}`, { state: { message: "Soal berhasil diubah!" } });
      } else {
        setError(data.message || 'Gagal update soal.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const interStyle = { fontFamily: "'Inter', sans-serif" };

  if (loading) {
    return <LoadingSpinner color="primary" />;
  }

  return (
    <EditPageLayout 
      title="Ubah Soal Pilihan Ganda" 
      subtitle="Perbarui pertanyaan pilihan ganda"
    >
      <FormTextarea
        label="PERTANYAAN"
        value={pertanyaan}
        onChange={(e) => {
          setPertanyaan(e.target.value);
          if (error) setError('');
        }}
        error={error}
        placeholder="Masukkan pertanyaan soal..."
      />

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <label className="form-label fw-bold small text-secondary text-uppercase mb-0"
            style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
            OPSI JAWABAN
          </label>
          <button
            type="button"
            className="btn btn-sm btn-link text-decoration-none fw-semibold"
            onClick={handleAddOpsi}
            style={{ fontSize: '12px' }}
          >
            + Tambah Opsi
          </button>
        </div>

        <div className="d-flex flex-column gap-3">
          {opsi.map((o, index) => (
            <div key={index} className="d-flex align-items-center gap-2">
              <div className="flex-grow-1 position-relative">
                <span
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 fw-bold text-muted"
                  style={{ fontSize: '12px' }}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="text"
                  className="form-control border-light rounded-3 py-2 ps-5"
                  placeholder={`Masukkan teks opsi ${String.fromCharCode(65 + index)}`}
                  value={o.text_opsi}
                  onChange={(e) => handleOpsiChange(index, e.target.value)}
                  style={{
                    ...interStyle,
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className="form-check d-flex align-items-center mb-0" style={{ minWidth: '120px' }}>
                <input
                  className="form-check-input me-2"
                  type="radio"
                  name="correct-answer"
                  id={`correct-${index}`}
                  checked={o.is_correct}
                  onChange={() => handleCorrectAnswerChange(index)}
                  style={{ cursor: 'pointer' }}
                />
                <label
                  className={`form-check-label small fw-medium ${o.is_correct ? 'text-success' : 'text-muted'}`}
                  htmlFor={`correct-${index}`}
                  style={{ cursor: 'pointer', fontSize: '13px' }}
                >
                  {o.is_correct ? 'Jawaban Benar' : 'Benar?'}
                </label>
              </div>

              {opsi.length > 2 && (
                <button
                  type="button"
                  className="btn btn-light text-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                  onClick={() => handleRemoveOpsi(index)}
                  style={{ width: '32px', height: '32px', backgroundColor: '#fee2e2' }}
                  title="Hapus Opsi"
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small border-0 mb-4 rounded-3 d-flex align-items-center">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {error}
        </div>
      )}

      <FormFooter 
        onCancel={() => navigate(-1)}
        onSubmit={handleSave}
        isSaving={isSaving}
      />
    </EditPageLayout>
  );
}
