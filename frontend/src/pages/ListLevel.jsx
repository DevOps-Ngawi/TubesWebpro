import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./styles/ListLevel.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import AddLevelModal from "../components/AddLevelModal";
import UpdateLevelModal from "../components/UpdateLevelModal";
import DeleteLevelModal from "../components/DeleteLevelModal";
import EditSectionModal from "../components/EditSectionModal";

const LevelPage = () => {
  const navigate = useNavigate();

  const { slugSection } = useParams();

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [sections, setSections] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [newLevelName, setNewLevelName] = useState("");
  const [newLevelDescription, setNewLevelDescription] = useState("");
  const [newLevelOrder, setNewLevelOrder] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLevelName, setUpdateLevelName] = useState("");
  const [updateSectionId, setUpdateSectionId] = useState("");

  const [currentSectionObj, setCurrentSectionObj] = useState(null);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [editSectionName, setEditSectionName] = useState("");
  const [editSectionLoading, setEditSectionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleUpdateClick = (level) => {
    setSelectedLevel(level);
    setUpdateLevelName(level.nama);
    setUpdateSectionId(level?.id_section || "");
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (level) => {
    setSelectedLevel(level);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLevel) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/levels/${selectedLevel.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseJson = await response.json();

      if (responseJson?.payload?.statusCode !== 200) {
        throw new Error(responseJson.payload.message);
      }

      setLevels((prev) =>
        prev.filter((level) => level.id !== selectedLevel.id)
      );

      setShowDeleteModal(false);
      setSelectedLevel(null);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Level berhasil dihapus",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: `${err.message}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchLevels = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${slugSection}/levels`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = await response.json();

      if (responseJson?.payload?.statusCode !== 200) {
        throw new Error(responseJson.payload.message);
      }

      setLevels(responseJson.payload.datas || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLevel = async () => {
    try {
      if (!newLevelName || !selectedSectionId) {
        throw new Error("Nama level dan section wajib diisi");
      }
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/levels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama: newLevelName,
          idSection: selectedSectionId,
          deskripsi: newLevelDescription,
          urutan: newLevelOrder,
        }),
      });

      const responseJson = await response.json();

      if (responseJson?.payload?.statusCode !== 200) {
        throw new Error(responseJson.payload.message);
      }

      await fetchLevels();

      setShowAddModal(false);
      setNewLevelName("");
      setNewLevelDescription("");
      setNewLevelOrder("");

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Level berhasil ditambahkan",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: `${err.message}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLevel = async () => {
    try {
      if (!updateLevelName || !updateSectionId) {
        throw new Error("Nama level dan section wajib diisi");
      }
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/levels/${selectedLevel.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nama: updateLevelName,
            idSection: updateSectionId,
          }),
        }
      );

      const responseJson = await response.json();

      if (responseJson?.payload?.statusCode !== 200) {
        throw new Error(responseJson.payload.message);
      }

      await fetchLevels();
      setShowUpdateModal(false);
      setSelectedLevel(null);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Level berhasil diperbarui",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: `${err.message}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSectionClick = () => {
    if (currentSectionObj) {
      setEditSectionName(currentSectionObj.nama || "");
      setShowEditSectionModal(true);
    }
  };

  const handleEditSectionSubmit = async () => {
    if (!editSectionName.trim()) {
      Swal.fire("Peringatan", "Nama section tidak boleh kosong!", "warning");
      return;
    }
    const token = localStorage.getItem('token');
    try {
      setEditSectionLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sections/${currentSectionObj.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ nama: editSectionName })
      });
      if (!res.ok) throw new Error("Gagal mengubah data.");
      
      setShowEditSectionModal(false);
      Swal.fire('Berhasil!', 'Nama section diperbarui', 'success');
      
      setSectionName(editSectionName);
      setCurrentSectionObj(prev => ({ ...prev, nama: editSectionName }));
      setSections(prev => prev.map(s => s.id === currentSectionObj.id ? { ...s, nama: editSectionName } : s));
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    } finally {
      setEditSectionLoading(false);
    }
  };

  const [sortBy, setSortBy] = useState('oldest');

  const sortedLevels = useMemo(() => {
    return [...levels].sort((a, b) => {
      if (sortBy === 'az') {
        const aName = a.nama || a.nama_level || '';
        const bName = b.nama || b.nama_level || '';
        return aName.localeCompare(bName);
      } else if (sortBy === 'za') {
        const aName = a.nama || a.nama_level || '';
        const bName = b.nama || b.nama_level || '';
        return bName.localeCompare(aName);
      } else if (sortBy === 'newest') {
        return b.id - a.id;
      } else {
        // default: oldest
        return a.id - b.id;
      }
    });
  }, [levels, sortBy]);

  const filteredLevels = sortedLevels.filter((level) => {
    const levelName = (level.nama || level.nama_level || "").toLowerCase();
    const sectionName = (level.sections?.nama || level.nama_section || "").toLowerCase();
    const keyword = searchTerm.toLowerCase();

    return levelName.includes(keyword) || sectionName.includes(keyword);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLevels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLevels.length / itemsPerPage);

  // Effect 1: Fetch levels and sections from backend API on mount or when slugSection changes
  useEffect(() => {
    fetchLevels();

    const fetchSections = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const responseJson = await response.json();

        if (responseJson?.payload?.statusCode !== 200) {
          throw new Error(responseJson.payload.message);
        }

        setSections(responseJson.payload.datas || []);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchSections();
  }, [slugSection, navigate]);

  // Effect 2: Instantly synchronize local section details when slugSection or sections change
  useEffect(() => {
    if (slugSection) {
      localStorage.setItem("current_section_slug", slugSection);
      if (sections && sections.length > 0) {
        const currentSection = sections.find(s => s.slug === slugSection);
        if (currentSection) {
          setSelectedSectionId(currentSection.id);
          setSectionName(currentSection.nama);
          setCurrentSectionObj(currentSection);
        }
      }
    }
  }, [slugSection, sections]);

  return (
    <>
      <Navbar />

      <div className="container mt-5" style={{ position: 'relative', minHeight: '400px' }}>
        {loading && (
          <div 
            className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75 rounded-4 shadow-sm"
            style={{ 
              zIndex: 99, 
              top: 0, 
              left: 0, 
              backdropFilter: "blur(5px)",
              transition: "all 0.3s ease-in-out" 
            }}
          >
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
            <h5 className="fw-semibold text-secondary" style={{ animation: 'pulse 1.8s infinite ease-in-out' }}>Memuat data level...</h5>
          </div>
        )}
        <div className="row mb-4">
          <div className="col">
            <div className="mb-3">
              <button 
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-sm fw-semibold" 
                onClick={() => navigate('/homepage')} 
                title="Kembali"
              >
                <i className="bi bi-arrow-left me-2"></i> Kembali
              </button>
            </div>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="fw-bold mb-1 d-flex align-items-center gap-2">
                  Daftar Level {sectionName ? `- ${sectionName}` : ''}
                  {currentSectionObj && (
                    <button 
                      className="btn btn-sm btn-outline-secondary border-0 p-1 rounded-circle d-inline-flex align-items-center justify-content-center"
                      onClick={handleEditSectionClick}
                      title="Ubah Nama Seksi"
                      style={{ width: '28px', height: '28px', transition: 'all 0.2s' }}
                    >
                      <i className="bi bi-pencil-square text-warning" style={{ fontSize: '16px' }}></i>
                    </button>
                  )}
                </h1>
                <p className="text-muted mb-0">Kelola data level</p>
              </div>

              <button
                className="btn btn-success rounded-pill px-4"
                onClick={() => setShowAddModal(true)}
              >
                + Tambah Level
              </button>
            </div>
          </div>
        </div>

        <div className="row mb-3 align-items-center">
          <div className="col-md-4">
            <h5 className="fw-semibold mb-2 mb-md-0">Daftar Level</h5>
          </div>

          <div className="col-md-8 d-flex justify-content-md-end gap-3 align-items-center flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold text-nowrap">Urutkan:</span>
              <select 
                className="form-select bg-light border-0 rounded-pill px-3 fw-semibold text-secondary" 
                style={{ width: '200px', cursor: 'pointer', fontSize: '14px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="oldest">Terlama</option>
                <option value="newest">Terbaru</option>
                <option value="az">Nama A - Z</option>
                <option value="za">Nama Z - A</option>
              </select>
            </div>
            <div className="position-relative" style={{ width: '300px' }}>
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                className="form-control ps-5 rounded-pill bg-light border-0"
                placeholder="Cari level, seksi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase small">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Nama Level</th>
                  <th className="px-4 py-3">Seksi</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="spinner-border text-primary" />
                    </td>
                  </tr>
                )}

                {error && !loading && (
                  <tr>
                    <td colSpan="4" className="text-center text-danger py-4">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredLevels.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      Belum ada level
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  currentItems.map((level, index) => (
                    <tr key={level.id}>
                      <td className="px-4">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 fw-semibold">{level.nama}</td>
                      <td className="px-4">{level?.sections.nama || "-"}</td>
                      <td className="px-4 text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            onClick={() => navigate(`/list-soal/${level.id}`)}
                          >
                            Detil
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning rounded-pill px-3"
                            onClick={() => handleUpdateClick(level)}
                          >
                            Ubah
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                            onClick={() => handleDeleteClick(level)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white py-3 px-4 border-top">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="text-muted small mb-2 mb-md-0">
                Menampilkan{" "}
                {filteredLevels.length > 0 ? indexOfFirstItem + 1 : 0} ke{" "}
                {Math.min(indexOfLastItem, filteredLevels.length)} dari{" "}
                {filteredLevels.length} data
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center">
                  <span className="small text-muted me-2">Baris:</span>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                  </select>
                </div>

                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                      >
                        &lt;
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          currentPage === i + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
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
      <DeleteLevelModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        selectedLevel={selectedLevel}
        isSubmitting={isSubmitting}
      />
      <AddLevelModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddLevel}
        newLevelName={newLevelName}
        setNewLevelName={setNewLevelName}
        newLevelDescription={newLevelDescription}
        setNewLevelDescription={setNewLevelDescription}
        newLevelOrder={newLevelOrder}
        setNewLevelOrder={setNewLevelOrder}
        isSubmitting={isSubmitting}
      />
      <UpdateLevelModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateLevel}
        updateLevelName={updateLevelName}
        setUpdateLevelName={setUpdateLevelName}
        sections={sections}
        updateSectionId={updateSectionId}
        setUpdateSectionId={setUpdateSectionId}
        isSubmitting={isSubmitting}
      />
      <EditSectionModal
        show={showEditSectionModal}
        onClose={() => setShowEditSectionModal(false)}
        onSubmit={handleEditSectionSubmit}
        editName={editSectionName}
        setEditName={setEditSectionName}
        editLoading={editSectionLoading}
      />
    </>
  );
};

export default LevelPage;
