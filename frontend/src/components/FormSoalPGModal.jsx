import React, { useState, useEffect } from 'react';
import ModalShell from './ModalShell';

const createOption = () => ({ text_opsi: '', is_correct: false });
const INITIAL_OPTIONS = [createOption(), createOption()];

const FormSoalPGModal = ({ show, onClose, onSubmit, soal, isLoading, error, setError }) => {
  const [pertanyaan, setPertanyaan] = useState('');
  const [opsi, setOpsi] = useState(INITIAL_OPTIONS);

  useEffect(() => {
    if (show) {
      setError('');
      if (soal) {
        setPertanyaan(soal.text_soal || '');
        if (soal.opsis) {
          setOpsi(soal.opsis.map(o => ({ id: o.id, text_opsi: o.text_opsi || '', is_correct: !!o.is_correct })));
        } else {
          setOpsi([createOption(), createOption()]);
        }
      } else {
        setPertanyaan('');
        setOpsi([createOption(), createOption()]);
      }
    }
  }, [show, soal, setError]);

  const handleOpsiChange = (index, value) => {
    setOpsi(prev => prev.map((o, i) => i === index ? { ...o, text_opsi: value } : o));
    if (error) setError('');
  };

  const handleCorrectAnswerChange = (index) => {
    setOpsi(prev => prev.map((o, i) => ({ ...o, is_correct: i === index })));
    if (error) setError('');
  };

  const handleAddOpsi = () => {
    if (opsi.length >= 5) {
      setError('Maksimal opsi jawaban adalah 5.');
      return;
    }
    setOpsi(prev => [...prev, createOption()]);
  };

  const handleRemoveOpsi = (index) => {
    if (opsi.length <= 2) return;
    setOpsi(prev => prev.filter((_, i) => i !== index));
  };

  const handleAction = () => {
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

    onSubmit({ text_soal: pertanyaan, opsis: opsi });
  };

  const isEdit = !!soal;

  return (
    <ModalShell
      show={show}
      onClose={onClose}
      title={isEdit ? "Ubah Soal Pilihan Ganda" : "Tambah Soal Pilihan Ganda"}
      subtitle={isEdit ? "Perbarui pertanyaan pilihan ganda" : "Buat pertanyaan pilihan ganda untuk ujian Anda"}
      theme={isEdit ? "warning" : "success"}
      icon={isEdit ? <i className="bi bi-pencil-square fs-4"></i> : <i className="bi bi-list-task fs-4"></i>}
      actionLabel={isEdit ? "Ubah Soal" : "Simpan Soal"}
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
            placeholder="Masukkan soal pilihan ganda"
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
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label fw-bold small text-secondary text-uppercase mb-0" style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
              OPSI JAWABAN
            </label>
            <button
              type="button"
              className={`btn btn-sm ${opsi.length >= 5 ? 'btn-light text-muted' : 'btn-outline-primary'} rounded-pill px-3 fw-semibold shadow-sm`}
              onClick={handleAddOpsi}
              disabled={opsi.length >= 5}
              style={{ fontSize: '12px' }}
            >
              {opsi.length >= 5 ? 'Batas 5 Opsi Tercapai' : '+ Tambah Opsi'}
            </button>
          </div>

          <div className="d-flex flex-column gap-3">
            {opsi.map((item, index) => {
              const label = String.fromCharCode(65 + index);
              const isCorrect = item.is_correct;
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-4 border transition-all ${isCorrect ? 'bg-success bg-opacity-10 border-success shadow-sm' : 'bg-light border-light'}`}
                  style={{ transition: 'all 0.2s ease-in-out' }}
                >
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div 
                      className={`d-flex align-items-center justify-content-center rounded-circle fw-bold text-white transition-all ${isCorrect ? 'bg-success shadow-sm' : 'bg-primary'}`} 
                      style={{ width: '28px', height: '28px', fontSize: '13px', transition: 'all 0.2s', flexShrink: 0 }}
                    >
                      {label}
                    </div>
                    <input
                      type="text"
                      className="form-control border-light rounded-3 p-2 bg-white"
                      placeholder={`Masukkan teks opsi ${label}`}
                      value={item.text_opsi}
                      onChange={(e) => handleOpsiChange(index, e.target.value)}
                      autoComplete="new-password"
                      spellCheck="false"
                      autoCorrect="off"
                      style={{ fontSize: '14px' }}
                    />
                    {opsi.length > 2 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-light rounded-circle text-danger d-flex align-items-center justify-content-center shadow-sm"
                        onClick={() => handleRemoveOpsi(index)}
                        style={{ width: '32px', height: '32px', backgroundColor: '#fee2e2' }}
                        title="Hapus opsi"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                  
                  <div 
                    className="d-flex align-items-center gap-2 mt-2 p-1 px-2 rounded-pill border-0" 
                    onClick={() => handleCorrectAnswerChange(index)}
                    style={{ cursor: 'pointer', width: 'fit-content', backgroundColor: isCorrect ? 'rgba(25, 135, 84, 0.15)' : 'transparent', transition: 'all 0.2s' }}
                  >
                    <input
                      className="form-check-input mt-0"
                      type="radio"
                      name="correct-option-group"
                      id={`correct-opt-${index}`}
                      checked={isCorrect}
                      onChange={() => handleCorrectAnswerChange(index)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <label 
                      className={`form-check-label small fw-bold mb-0 transition-all ${isCorrect ? 'text-success' : 'text-secondary'}`} 
                      htmlFor={`correct-opt-${index}`} 
                      style={{ cursor: 'pointer', fontSize: '12px' }}
                    >
                      {isCorrect ? (
                        <span className="d-flex align-items-center gap-1">
                          ✓ Jawaban Benar (Kunci)
                        </span>
                      ) : (
                        "Jadikan Jawaban Benar"
                      )}
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
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

export default FormSoalPGModal;
