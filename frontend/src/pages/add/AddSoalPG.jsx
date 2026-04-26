import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Base URL for the backend API. */
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

/** Minimum number of answer options required. */
const MIN_OPTIONS = 2;

/** Factory for creating a blank option object. */
const createOption = () => ({ text_opsi: '', is_correct: false });

/** Default set of options when the form is first rendered. */
const INITIAL_OPTIONS = [createOption(), createOption()];

/** Converts a zero-based index to an uppercase letter (0 → "A", 1 → "B", …). */
const getOptionLabel = (index) => String.fromCodePoint(65 + index);

// ─── Validation Messages ──────────────────────────────────────────────────────

const VALIDATION = Object.freeze({
  QUESTION_REQUIRED: 'Pertanyaan wajib diisi.',
  ALL_OPTIONS_REQUIRED: 'Semua opsi jawaban harus diisi.',
  CORRECT_ANSWER_REQUIRED: 'Pilih salah satu jawaban yang benar.',
  MIN_OPTIONS: `Minimal harus ada ${MIN_OPTIONS} opsi jawaban.`,
  SAVE_FAILED: 'Gagal menyimpan soal.',
  NETWORK_ERROR: 'Gagal terhubung ke server. Periksa koneksi Anda.',
});

// ─── Reusable Inline Styles ───────────────────────────────────────────────────

const STYLES = Object.freeze({
  fontBase: { fontFamily: "'Inter', sans-serif" },
  inputBg: {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
  },
  heading: { color: '#0f172a', letterSpacing: '-0.02em' },
  label: { letterSpacing: '0.05em', fontSize: '11px' },
  iconBox: { width: '50px', height: '50px' },
  optionLabel: { fontSize: '12px' },
  optionInput: { fontSize: '14px' },
  radioLabel: { cursor: 'pointer', fontSize: '13px' },
  deleteBtn: { width: '32px', height: '32px', backgroundColor: '#fee2e2' },
  cancelBtn: { backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '14px' },
  saveBtn: { minWidth: '160px', backgroundColor: '#0d6efd', fontSize: '14px' },
  textarea: {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    resize: 'vertical',
    minHeight: '100px',
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Page for creating a new multiple-choice (Pilihan Ganda) question.
 *
 * Reads `current_level_id` and `token` from localStorage.
 * On success, navigates back to the question list for that level.
 */
export default function AddSoalPG() {
  const navigate = useNavigate();

  const [pertanyaan, setPertanyaan] = useState('');
  const [opsi, setOpsi] = useState(INITIAL_OPTIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ─── Helpers ──────────────────────────────────────────────────────────

  /** Clears the current error message (no-op if already empty). */
  const clearError = useCallback(() => {
    setError((prev) => (prev ? '' : prev));
  }, []);

  // ─── Validation ───────────────────────────────────────────────────────

  /**
   * Validates all form fields.
   * @returns {string|null} An error message, or `null` if the form is valid.
   */
  const validate = useCallback(() => {
    if (!pertanyaan.trim()) return VALIDATION.QUESTION_REQUIRED;
    if (opsi.some((o) => !o.text_opsi.trim())) return VALIDATION.ALL_OPTIONS_REQUIRED;
    if (!opsi.some((o) => o.is_correct)) return VALIDATION.CORRECT_ANSWER_REQUIRED;
    return null;
  }, [pertanyaan, opsi]);

  // ─── Event Handlers ───────────────────────────────────────────────────

  /** Updates the question text and clears any existing error. */
  const handlePertanyaanChange = useCallback(
    (e) => {
      setPertanyaan(e.target.value);
      clearError();
    },
    [clearError],
  );

  /**
   * Updates the text of a specific option by index.
   * Uses a proper immutable update to avoid mutating existing state objects.
   */
  const handleOpsiChange = useCallback(
    (index, value) => {
      setOpsi((prev) =>
        prev.map((o, i) => (i === index ? { ...o, text_opsi: value } : o)),
      );
      clearError();
    },
    [clearError],
  );

  /** Marks exactly one option as the correct answer (radio behaviour). */
  const handleCorrectAnswerChange = useCallback(
    (index) => {
      setOpsi((prev) =>
        prev.map((o, i) => ({ ...o, is_correct: i === index })),
      );
      clearError();
    },
    [clearError],
  );

  /** Appends a new blank option to the list. */
  const handleAddOpsi = useCallback(() => {
    setOpsi((prev) => [...prev, createOption()]);
  }, []);

  /** Removes an option at the given index, unless we're at the minimum. */
  const handleRemoveOpsi = useCallback((index) => {
    setOpsi((prev) => {
      if (prev.length <= MIN_OPTIONS) return prev;
      return prev.filter((_, i) => i !== index);
    });
    // Show error only if we can't actually remove
    setOpsi((prev) => {
      if (prev.length <= MIN_OPTIONS) {
        setError(VALIDATION.MIN_OPTIONS);
      }
      return prev;
    });
  }, []);

  /** Navigates back to the previous page. */
  const handleCancel = useCallback(() => navigate(-1), [navigate]);

  /** Validates and submits the form to the API. */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsSubmitting(true);

      try {
        const levelId = localStorage.getItem('current_level_id') || '1';
        const token = localStorage.getItem('token');

        const payload = {
          id_level: Number.parseInt(levelId, 10),
          text_soal: pertanyaan,
          opsi,
        };

        const response = await fetch(`${API_BASE_URL}/soals-pg`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          navigate(`/list-soal/${levelId}`, {
            state: { message: 'Soal berhasil ditambahkan!' },
          });
        } else {
          setError(data?.payload?.message || data?.message || VALIDATION.SAVE_FAILED);
        }
      } catch (err) {
        // Distinguish network errors from parsing errors
        const isNetworkError =
          err instanceof TypeError && err.message === 'Failed to fetch';
        setError(isNetworkError ? VALIDATION.NETWORK_ERROR : err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, pertanyaan, opsi, navigate],
  );

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 overflow-hidden"
      style={{ ...STYLES.fontBase, backgroundColor: '#f8fafc' }}
    >
      <div
        className="card border-0 shadow-sm rounded-4 w-100"
        style={{ maxWidth: '750px' }}
      >
        <form
          className="card-body p-4 p-md-5"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="d-flex align-items-center mb-4">
            <div
              className="bg-primary bg-opacity-10 d-flex align-items-center justify-content-center rounded-4 me-3"
              style={STYLES.iconBox}
            >
              <i className="bi bi-list-check text-primary fs-4" aria-hidden="true" />
            </div>
            <div>
              <h1 className="h4 fw-bold mb-1" style={STYLES.heading}>
                Tambah Soal Pilihan Ganda
              </h1>
              <p className="text-muted small mb-0">
                Buat pertanyaan pilihan ganda untuk ujian Anda
              </p>
            </div>
          </div>

          {/* ── Question Input ─────────────────────────────────────── */}
          <div className="mb-4">
            <label
              htmlFor="pertanyaan-input"
              className="form-label fw-bold small text-secondary text-uppercase mb-2"
              style={STYLES.label}
            >
              PERTANYAAN
            </label>
            <textarea
              id="pertanyaan-input"
              className={`form-control border-light rounded-3 p-3 ${error && !pertanyaan.trim() ? 'is-invalid' : ''
                }`}
              rows="3"
              value={pertanyaan}
              onChange={handlePertanyaanChange}
              placeholder="Masukkan pertanyaan soal..."
              aria-required="true"
              aria-invalid={!!(error && !pertanyaan.trim())}
              style={STYLES.textarea}
            />
          </div>

          {/* ── Answer Options ─────────────────────────────────────── */}
          <fieldset className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <legend
                className="form-label fw-bold small text-secondary text-uppercase mb-0"
                style={STYLES.label}
              >
                OPSI JAWABAN
              </legend>
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none fw-semibold"
                onClick={handleAddOpsi}
                style={{ fontSize: '12px' }}
                aria-label="Tambah opsi jawaban baru"
              >
                + Tambah Opsi
              </button>
            </div>

            <div className="d-flex flex-column gap-3" role="radiogroup" aria-label="Pilih jawaban yang benar">
              {opsi.map((o, index) => {
                const label = getOptionLabel(index);
                const inputId = `opsi-${index}`;
                const radioId = `correct-${index}`;

                return (
                  <div key={inputId} className="d-flex align-items-center gap-2">
                    {/* Option text */}
                    <div className="flex-grow-1 position-relative">
                      <span
                        className="position-absolute top-50 start-0 translate-middle-y ms-3 fw-bold text-muted"
                        style={STYLES.optionLabel}
                        aria-hidden="true"
                      >
                        {label}
                      </span>
                      <input
                        id={inputId}
                        type="text"
                        className="form-control border-light rounded-3 py-2 ps-5"
                        placeholder={`Masukkan teks opsi ${label}`}
                        value={o.text_opsi}
                        onChange={(e) => handleOpsiChange(index, e.target.value)}
                        aria-label={`Teks opsi ${label}`}
                        style={{ ...STYLES.inputBg, ...STYLES.optionInput }}
                      />
                    </div>

                    {/* Correct-answer radio */}
                    <div
                      className="form-check d-flex align-items-center mb-0"
                      style={{ minWidth: '120px' }}
                    >
                      <input
                        className="form-check-input me-2"
                        type="radio"
                        name="correct-answer"
                        id={radioId}
                        checked={o.is_correct}
                        onChange={() => handleCorrectAnswerChange(index)}
                        style={{ cursor: 'pointer' }}
                        aria-label={`Tandai opsi ${label} sebagai jawaban benar`}
                      />
                      <label
                        className={`form-check-label small fw-medium ${o.is_correct ? 'text-success' : 'text-muted'
                          }`}
                        htmlFor={radioId}
                        style={STYLES.radioLabel}
                      >
                        {o.is_correct ? 'Jawaban Benar' : 'Benar?'}
                      </label>
                    </div>

                    {/* Delete button (hidden when at minimum options) */}
                    {opsi.length > MIN_OPTIONS && (
                      <button
                        type="button"
                        className="btn btn-light text-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                        onClick={() => handleRemoveOpsi(index)}
                        style={STYLES.deleteBtn}
                        title={`Hapus opsi ${label}`}
                        aria-label={`Hapus opsi ${label}`}
                      >
                        <i className="bi bi-trash" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>

          {/* ── Error Alert ────────────────────────────────────────── */}
          {error && (
            <div
              className="alert alert-danger py-2 small border-0 mb-4 rounded-3 d-flex align-items-center"
              role="alert"
            >
              <i className="bi bi-exclamation-circle-fill me-2" aria-hidden="true" />
              {error}
            </div>
          )}

          {/* ── Action Buttons ─────────────────────────────────────── */}
          <div className="d-flex justify-content-end gap-2 mt-2">
            <button
              type="button"
              className="btn btn-light px-4 py-2 fw-semibold rounded-3 border-0"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{ ...STYLES.fontBase, ...STYLES.cancelBtn }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 fw-semibold rounded-3 shadow-sm border-0"
              disabled={isSubmitting}
              style={{ ...STYLES.fontBase, ...STYLES.saveBtn }}
            >
              {isSubmitting ? (
                <output className="d-inline-flex align-items-center">
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />
                  <span>Menyimpan…</span>
                </output>
              ) : (
                'Simpan Soal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
