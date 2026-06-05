import React, { useState, useEffect } from 'react';
import ModalShell from './ModalShell';

const FormSoalEsaiModal = ({ show, onClose, onSubmit, soal, isLoading, error, setError }) => {
  const [pertanyaan, setPertanyaan] = useState('');
  const [kataKunci, setKataKunci] = useState('');

  useEffect(() => {
    if (show) {
      setError('');
      if (soal) {
        setPertanyaan(soal.text_soal || '');
        setKataKunci(soal.kata_kunci || '');
      } else {
        setPertanyaan('');
        setKataKunci('');
      }
    }
  }, [show, soal, setError]);

  const handleAction = () => {
    setError('');
    if (!pertanyaan.trim()) {
      setError('Pertanyaan wajib diisi.');
      return;
    }
    onSubmit({ text_soal: pertanyaan, kata_kunci: kataKunci });
  };

  const isEdit = !!soal;

  return (
    <ModalShell
      show={show}
      onClose={onClose}
      title={isEdit ? "Ubah Soal Esai" : "Tambah Soal Esai Baru"}
      subtitle={isEdit ? "Ubah pertanyaan esai" : "Buat pertanyaan esai untuk ujian Anda"}
      theme={isEdit ? "warning" : "success"}
      icon={isEdit ? <i className="bi bi-pencil-square fs-4"></i> : <i className="bi bi-file-earmark-text fs-4"></i>}
      actionLabel={isEdit ? "Ubah Soal" : "Tambah Soal"}
      onAction={handleAction}
      isLoading={isLoading}
      size="lg"
    >
      <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
        <div className="mb-3">
          <label className="form-label fw-bold small text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
            PERTANYAAN
          </label>
          <textarea
            className={`form-control border-light rounded-3 p-3 ${error && !pertanyaan.trim() ? 'is-invalid' : ''}`}
            rows="3"
            value={pertanyaan}
            onChange={(e) => {
              setPertanyaan(e.target.value);
              if (error) setError('');
            }}
            placeholder="Masukkan soal esai"
            autoComplete="new-password"
            spellCheck="false"
            autoCorrect="off"
            style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', resize: 'vertical' }}
          />
          {error && !pertanyaan.trim() && (
            <div className="invalid-feedback d-flex align-items-center gap-1 mt-1">
              <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '12px' }}></i>
              Pertanyaan wajib diisi.
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
            KATA KUNCI JAWABAN
          </label>
          <textarea
            className="form-control border-light rounded-3 p-3"
            rows="3"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Masukkan kata kunci jawaban"
            autoComplete="new-password"
            spellCheck="false"
            autoCorrect="off"
            style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', resize: 'vertical' }}
          />
        </div>
      </form>

      {error && (
        <div className="alert alert-danger py-2 small border-0 mb-0 rounded-3 d-flex align-items-center">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {error}
        </div>
      )}
    </ModalShell>
  );
};

export default FormSoalEsaiModal;
