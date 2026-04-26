import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Custom hook untuk mengelola state & logic edit soal (shared antara EditSoalEsai & EditSoalPG).
 *
 * @param {Object} options
 * @param {string} options.apiUrl - Base URL API (tanpa ID), e.g. '${import.meta.env.VITE_API_URL}/api/soal-esai'
 * @param {Function} options.onFetchSuccess - Callback saat fetch berhasil, menerima `datas` dari response
 * @returns {{ loadingFetch, isSaving, error, setError, levelId, handleSave }}
 */
export default function useEditSoal({ apiUrl, onFetchSuccess }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingFetch, setLoadingFetch] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [levelId, setLevelId] = useState('');

  useEffect(() => {
    const fetchDetailSoal = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.payload?.datas) {
          setLevelId(result.payload.datas.id_level);
          onFetchSuccess(result.payload.datas);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingFetch(false);
      }
    };

    if (id) fetchDetailSoal();
  }, [id]);

  /**
   * Simpan perubahan soal ke API.
   *
   * @param {Object} options
   * @param {Object} options.body - Request body untuk PUT
   * @param {Function} [options.validate] - Fungsi validasi, return string error atau falsy jika valid
   */
  const handleSave = async ({ body, validate }) => {
    setError('');

    if (validate) {
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        navigate(`/list-soal/${levelId}`, { state: { message: "Soal berhasil diubah!" } });
      } else {
        const result = await response.json();
        setError(result.payload?.message || 'Gagal memperbarui soal.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return { loadingFetch, isSaving, error, setError, levelId, handleSave, navigate };
}
