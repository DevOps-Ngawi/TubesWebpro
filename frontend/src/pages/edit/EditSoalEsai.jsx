import React, { useState, useCallback } from 'react';
import useEditSoal from '../../hooks/useEditSoal';
import EditSoalLayout from '../../components/EditSoalLayout';

export default function EditSoalEsai() {
  const [pertanyaan, setPertanyaan] = useState('');
  const [kataKunci, setKataKunci] = useState('');

  const handleFetchSuccess = useCallback((datas) => {
    setPertanyaan(datas.text_soal);
    setKataKunci(datas.kata_kunci || '');
  }, []);

  const { 
    loadingFetch, 
    isSaving, 
    error, 
    setError, 
    handleSave, 
    handleCancel,
    markAsDirty 
  } = useEditSoal({
    apiUrl: 'http://localhost:3030/api/soal-esai',
    onFetchSuccess: handleFetchSuccess
  });

  const onSave = () => {
    handleSave({
      validate: () => {
        if (!pertanyaan.trim()) return 'Pertanyaan wajib diisi.';
        return null;
      },
      body: {
        text_soal: pertanyaan,
        kata_kunci: kataKunci
      }
    });
  };

  const interStyle = { fontFamily: "'Inter', sans-serif" };

  return (
    <EditSoalLayout
      title="Ubah Soal Esai"
      subtitle="Ubah pertanyaan esai"
      loading={loadingFetch}
      isSaving={isSaving}
      error={error}
      onSave={onSave}
      onCancel={handleCancel}
    >
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
            markAsDirty();
            if(error) setError('');
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
          onChange={(e) => {
            setKataKunci(e.target.value);
            markAsDirty();
          }}
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
    </EditSoalLayout>
  );
}