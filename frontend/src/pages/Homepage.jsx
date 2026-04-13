import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardStats from '../components/DashboardStats';
import Swal from 'sweetalert2';

const Homepage = () => {
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

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

  const fetchSections = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3030/api/sections-php", {
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

      if (!response.ok) {
        throw new Error("Gagal mengambil data section dari server.");
      }

      const responseJson = await response.json();
      const validData = responseJson?.payload?.datas || [];
      setSections(validData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching sections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [navigate]);

  const filteredSections = sections.filter((section) =>
    section.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentSections = filteredSections.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSections.length / rowsPerPage);

  const handleDetailsClick = (sectionId) => {
    navigate(`/sections/${sectionId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handler buka modal edit
  const handleEditClick = (section) => {
    setEditSection(section);
    setEditName(section.nama || '');
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editName.trim()) {
      setEditError('Nama section tidak boleh kosong!');
      return;
    }
    setEditError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setEditLoading(true);
      const response = await fetch(`http://localhost:3030/api/sections/${editSection.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ nama: editName })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal mengubah section.");
      }

      setShowEditModal(false);
      setEditSection(null);
      setEditName('');
      fetchSections();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Berhasil mengubah nama section',
        confirmButtonColor: '#0d6efd'
      });
    } catch (err) {
      alert(err.message);
      console.error("Error updating section:", err);
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
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(`http://localhost:3030/api/sections/${deleteSection.id}`, {
        method: "DELETE",
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

      if (!response.ok) {
        throw new Error("Gagal menghapus section.");
      }

      setShowDeleteModal(false);
      setDeleteSection(null);
      fetchSections();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Section berhasil dihapus',
        confirmButtonColor: '#0d6efd'
      });
    } catch (err) {
      alert(err.message);
      console.error("Error deleting section:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddClick = () => {
    setAddName('');
    setAddError('');
    setShowAddModal(true);
  };

  const handleAddSubmit = async () => {
    if (!addName.trim()) {
      setAddError('Nama section tidak boleh kosong!');
      return;
    }
    setAddError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setAddLoading(true);
      const response = await fetch('http://localhost:3030/api/sections', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          nama: addName,
          slug: addName.toLowerCase().replace(/\s+/g, '-')
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal menambah section.");
      }

      setShowAddModal(false);
      setAddName('');
      fetchSections();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Berhasil menambah section',
        confirmButtonColor: '#0d6efd'
      });
    } catch (err) {
      alert(err.message);
      console.error("Error creating section:", err);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        {/* Dashboard Charts */}
        <DashboardStats />

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-1">Daftar Section</h1>
            <p className="text-muted">Kelola data section</p>
          </div>
          <button
            className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2"
            onClick={handleAddClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            Tambah Section
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 px-4 border-bottom">
            <div className="d-flex justify-content-end align-items-center">
              <div style={{ position: 'relative', width: '300px' }}>
                <input
                  type="text"
                  className="form-control bg-light border-0 ps-5 rounded-pill"
                  placeholder="Cari section..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{ paddingRight: '1rem', height: '42px' }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  className="bi bi-search text-muted"
                  viewBox="0 0 16 16"
                  style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)' }}
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">No</th>
                  <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Judul Section</th>
                  <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Jumlah Level</th>
                  <th className="px-4 py-3 text-secondary text-uppercase small fw-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentSections.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      {searchTerm ? 'Tidak ada hasil pencarian.' : 'Tidak ada data section tersedia.'}
                    </td>
                  </tr>
                ) : (
                  currentSections.map((section, index) => (
                    <tr key={section.id}>
                      <td className="px-4">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 fw-bold text-dark">{section.nama || "Tanpa Judul"}</td>
                      <td className="px-4">
                        <span className="badge bg-light text-dark border">
                          {section.levels ? `${section.levels.length} Level` : section.jumlah_level ? `${section.jumlah_level} Level` : "0 Level"}
                        </span>
                      </td>
                      <td className="px-4 text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            onClick={() => navigate(`/${section.slug}/levels`)}
                          >
                            Detil
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning rounded-pill px-3"
                            onClick={() => handleEditClick(section)}
                          >
                            Ubah
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                            onClick={() => handleDeleteClick(section)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="card-footer bg-white border-top py-3 px-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="text-muted small mb-2 mb-md-0">
                Menampilkan {filteredSections.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredSections.length)} dari {filteredSections.length} data
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center">
                  <label className="me-2 small text-muted">Baris per halaman:</label>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: '70px' }}
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                  </select>
                </div>

                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link rounded-start-pill"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        &lt;
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                      <button
                        className="page-link rounded-end-pill"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        &gt;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit Section */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Ubah Nama Section</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label text-muted small">Nama Section</label>
                  <input
                    type="text"
                    className={`form-control ${editError ? 'is-invalid' : ''}`}
                    value={editName}
                    onChange={(e) => { setEditName(e.target.value); setEditError(''); }}
                    placeholder="Masukkan nama section..."
                    disabled={editLoading}
                  />
                  {editError && <div className="text-danger small mt-1">{editError}</div>}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={handleEditSubmit}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Menyimpan...
                    </>
                  ) : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Section */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">Hapus Section</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  Apakah Anda yakin ingin menghapus section <strong>"{deleteSection?.nama}"</strong>?
                </p>
                <p className="text-muted small mt-2 mb-0">
                  Tindakan ini tidak dapat dibatalkan dan akan menghapus semua level yang terkait.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4"
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Menghapus...
                    </>
                  ) : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Section */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">Tambah Section Baru</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label text-muted small">Nama Section</label>
                  <input
                    type="text"
                    className={`form-control ${addError ? 'is-invalid' : ''}`}
                    value={addName}
                    onChange={(e) => { setAddName(e.target.value); setAddError(''); }}
                    placeholder="Masukkan nama section baru..."
                    disabled={addLoading}
                  />
                  {addError && <div className="text-danger small mt-1">{addError}</div>}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={handleAddSubmit}
                  disabled={addLoading}
                >
                  {addLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Menyimpan...
                    </>
                  ) : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Homepage;