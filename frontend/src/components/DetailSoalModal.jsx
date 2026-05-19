import React from 'react';
import ModalShell from './ModalShell';

const DetailSoalModal = ({ show, onClose, onEdit, soal }) => {
  if (!soal) return null;

  const isPG = soal.tipe === 'pg';

  return (
    <ModalShell
      show={show}
      onClose={onClose}
      title={isPG ? "Detil Soal Pilihan Ganda" : "Detil Soal Esai"}
      subtitle={isPG ? "Informasi lengkap mengenai pertanyaan pilihan ganda" : "Informasi lengkap mengenai pertanyaan esai"}
      theme="primary"
      icon={<i className="bi bi-info-circle-fill fs-4"></i>}
      cancelLabel={isPG ? "Ubah Soal PG" : "Ubah Soal Esai"}
      onCancel={() => {
        onClose();
        onEdit(soal);
      }}
      cancelClass="btn text-white rounded-3 px-4 py-2 border-0 fw-semibold"
      cancelStyle={{ backgroundColor: "#ffb300" }} // Matches mockup yellow button exactly!
      actionLabel="Kembali"
      actionClass="btn btn-light text-dark rounded-3 px-4 py-2 border-0 fw-semibold"
      onAction={onClose}
    >
      <div className="mb-3">
        <label className="fw-bold small text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
          PERTANYAAN
        </label>
        <div className="p-3 bg-light rounded-3 border text-wrap" style={{ minHeight: '60px' }}>
          {soal.text_soal}
        </div>
      </div>

      {isPG ? (
        <div className="mb-3">
          <label className="fw-bold small text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
            OPSI JAWABAN
          </label>
          <div className="d-flex flex-column gap-2">
            {soal.opsis?.map((o, index) => (
              <div
                key={o.id || index}
                className={`d-flex align-items-center p-3 rounded-3 border ${o.is_correct ? 'bg-success bg-opacity-10 border-success' : 'bg-white border-light'}`}
              >
                <div
                  className={`d-flex align-items-center justify-content-center rounded-circle me-3 fw-bold ${o.is_correct ? 'bg-success text-white' : 'bg-light text-secondary'}`}
                  style={{ width: '32px', height: '32px', fontSize: '14px', flexShrink: 0 }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <div className={`flex-grow-1 ${o.is_correct ? 'text-success fw-medium' : 'text-dark'}`}>
                  {o.text_opsi}
                </div>
                {o.is_correct && (
                  <span className="badge bg-success rounded-pill px-3 py-2 ms-2">
                    ✓ Benar
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <label className="fw-bold small text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
            KATA KUNCI JAWABAN
          </label>
          <div className="p-3 bg-light rounded-3 border text-wrap" style={{ minHeight: '60px' }}>
            {soal.kata_kunci || 'Tidak ada kata kunci'}
          </div>
        </div>
      )}
    </ModalShell>
  );
};

export default DetailSoalModal;
