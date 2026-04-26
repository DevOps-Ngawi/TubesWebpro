import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardStats from '../components/DashboardStats';
import TablePagination from '../components/TablePagination';
import { useTable } from '../hooks/useTable';
import Swal from 'sweetalert2';

const Homepage = () => {
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSection, setDeleteSection] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const {
    searchTerm,
    handleSearch,
    currentPage,
    handlePageChange,
    rowsPerPage,
    handleRowsChange,
    currentItems,
    totalPages,
    filteredCount,
    indexOfFirstItem
  } = useTable(sections, ['nama'], 5);

  const fetchSections = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3030/api/sections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) throw new Error("Gagal mengambil data dari server.");

      const responseJson = await response.json();
      setSections(responseJson?.payload?.datas || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleEditClick = (section) => {
    setEditSection(section);
    setEditName(section.nama || '');
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editName.trim()) return setEditError('Nama tidak boleh kosong!');
    const token = localStorage.getItem('token');
    try {
      setEditLoading(true);
      const res = await fetch(`http://localhost:3030/api/sections/${editSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ nama: editName })
      });
      if (!res.ok) throw new Error("Gagal mengubah data.");
      setShowEditModal(false);
      fetchSections();
      Swal.fire('Berhasil!', 'Nama section diperbarui', 'success');
    } catch (err) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (section) => {
    setDeleteSection(section);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem('token');
    try {
      setDeleteLoading(true);
      const res = await fetch(`http://localhost:3030/api/sections/${deleteSection.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal menghapus.");
      setShowDeleteModal(false);
      fetchSections();
      Swal.fire('Berhasil!', 'Section dihapus', 'success');
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddSubmit = async () => {
    if (!addName.trim()) return setAddError('Nama tidak boleh kosong!');
    const token = localStorage.getItem('token');
    try {
      setAddLoading(true);
      const res = await fetch('http://localhost:3030/api/sections', {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ nama: addName, slug: addName.toLowerCase().replace(/\s+/g, '-') })
      });
      if (!res.ok) throw new Error("Gagal menambah data.");
      setShowAddModal(false);
      setAddName('');
      fetchSections();
      Swal.fire('Berhasil!', 'Section baru ditambahkan', 'success');
    } catch (err) {
      alert(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <DashboardStats />

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-1">Daftar Section</h1>
            <p className="text-muted">Kelola data section aplikasi</p>
          </div>
          <button className="btn btn-success rounded-pill px-4" onClick={() => setShowAddModal(true)}>
            + Tambah Section
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 px-4 border-bottom">
            <div className="d-flex justify-content-end">
              <div style={{ position: 'relative', width: '300px' }}>
                <input
                  type="text"
                  className="form-control bg-light border-0 ps-5 rounded-pill"
                  placeholder="Cari section..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <i className="bi bi-search text-muted" style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)' }}></i>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-secondary small fw-bold">NO</th>
                  <th className="px-4 py-3 text-secondary small fw-bold">JUDUL SECTION</th>
                  <th className="px-4 py-3 text-secondary small fw-bold">JUMLAH LEVEL</th>
                  <th className="px-4 py-3 text-secondary small fw-bold text-center">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">Data tidak ditemukan.</td></tr>
                ) : (
                  currentItems.map((section, index) => (
                    <tr key={section.id}>
                      <td className="px-4">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 fw-bold">{section.nama}</td>
                      <td className="px-4">
                        <span className="badge bg-light text-dark border">
                          {section.levels?.length || 0} Level
                        </span>
                      </td>
                      <td className="px-4 text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => navigate(`/${section.slug}/levels`)}>Detil</button>
                          <button className="btn btn-sm btn-outline-warning rounded-pill px-3" onClick={() => handleEditClick(section)}>Ubah</button>
                          <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDeleteClick(section)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <TablePagination 
            totalData={filteredCount}
            startIndex={indexOfFirstItem}
            endIndex={indexOfFirstItem + rowsPerPage}
            rowsPerPage={rowsPerPage}
            onRowsChange={handleRowsChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default Homepage;