import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Custom hook untuk mengelola state & logic edit soal (shared antara EditSoalEsai & EditSoalPG).
 *
 * @param {Object} options
 * @param {string} options.apiUrl - Base URL API (tanpa ID), e.g. 'http://localhost:3030/api/soal-esai'
 * @param {Function} options.onFetchSuccess - Callback saat fetch berhasil, menerima `datas` dari response
 * @returns {{ loadingFetch, isSaving, error, setError, levelId, handleSave, refetch, isDirty, markAsDirty, handleCancel }}
 */
export default function useEditSoal({ apiUrl, onFetchSuccess }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingFetch, setLoadingFetch] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [levelId, setLevelId] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const fetchDetailSoal = useCallback(async () => {
    try {
      setLoadingFetch(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.payload?.datas) {
        setLevelId(result.payload.datas.id_level);
        onFetchSuccess(result.payload.datas);
      }
      setIsDirty(false); // Reset dirty state on fetch
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFetch(false);
    }
  }, [apiUrl, id, onFetchSuccess]);

  useEffect(() => {
    if (id) fetchDetailSoal();
  }, [id, fetchDetailSoal]);

  const refetch = () => {
    fetchDetailSoal();
  };

  const markAsDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm('Ada perubahan yang belum disimpan. Yakin ingin membatalkan?');
      if (confirmLeave) navigate(-1);
    } else {
      navigate(-1);
    }
  };

  /**
   * Simpan perubahan soal ke API.
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
        setIsDirty(false); // Reset dirty state on success
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

  return { 
    loadingFetch, 
    isSaving, 
    error, 
    setError, 
    levelId, 
    handleSave, 
    navigate, 
    refetch, 
    isDirty, 
    markAsDirty, 
    handleCancel 
  };
}
