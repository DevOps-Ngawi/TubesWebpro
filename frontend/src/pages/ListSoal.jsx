import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./styles/ListLevel.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const ListSoal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id_level } = useParams();

  const [soals, setSoals] = useState([]);
  const [levelName, setLevelName] = useState("");
  const [sectionSlug, setSectionSlug] = useState(() => {
    return localStorage.getItem("current_section_slug") || "";
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSoal, setSelectedSoal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: location.state.message,
        timer: 2000,
        showConfirmButton: false,
      });
      window.history.replaceState({}, document.title);
    }

    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const resLevel = await fetch(`${import.meta.env.VITE_API_URL}/api/levels/${id_level}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resLevel.ok) {
          const result = await resLevel.json();
          const levelData = result.payload?.datas;
          
          if (levelData?.nama) {
            setLevelName(levelData.nama);
          } else {
            setLevelName("Level " + id_level);
          }
          
           // Fallback: If section object wasn't included by backend, fetch all sections and match
          if (levelData?.sections?.slug) {
            setSectionSlug(levelData.sections.slug);
            localStorage.setItem("current_section_slug", levelData.sections.slug);
          } else if (levelData?.id_section) {
            try {
              const resSections = await fetch(`${import.meta.env.VITE_API_URL}/api/sections`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (resSections.ok) {
                const secResult = await resSections.json();
                const sectionsList = secResult.payload?.datas || [];
                const matchedSection = sectionsList.find(s => s.id === levelData.id_section);
                if (matchedSection?.slug) {
                  setSectionSlug(matchedSection.slug);
                  localStorage.setItem("current_section_slug", matchedSection.slug);
                }
              }
            } catch (err) {
              console.error("Gagal mengambil section slug:", err);
            }
          }
        }

        const resEsai = await fetch(`${import.meta.env.VITE_API_URL}/api/soal-esai/level/${id_level}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const resPG = await fetch(`${import.meta.env.VITE_API_URL}/api/soals-pg/level/${id_level}`, {
          headers: { Authorization: `Bearer ${token}` },
        });


        let listEsai = [];
        if (resEsai.ok) {
          const dataEsai = await resEsai.json();
          listEsai = (dataEsai.payload?.datas || []).map(s => ({ ...s, tipe: 'esai' }));
        }

        let listPG = [];
        if (resPG.ok) {
          const dataPG = await resPG.json();
          listPG = (dataPG.payload?.datas || []).map(s => ({ ...s, tipe: 'pg' }));
        }

        setSoals([...listEsai, ...listPG]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_level, navigate, location]);

  const handleDeleteClick = (soal) => {
    setSelectedSoal(soal);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSoal) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = selectedSoal.tipe === 'esai'
        ? `${import.meta.env.VITE_API_URL}/api/soal-esai/${selectedSoal.id}`
        : `${import.meta.env.VITE_API_URL}/api/soals-pg/${selectedSoal.id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSoals((prev) => prev.filter((s) => s.id !== selectedSoal.id));
        setShowDeleteModal(false);
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Soal ${selectedSoal.tipe.toUpperCase()} berhasil dihapus`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal menghapus soal",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan koneksi.",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [sortBy, setSortBy] = useState('oldest');
  const [filterType, setFilterType] = useState('all');

  const sortedSoals = useMemo(() => {
    return [...soals].sort((a, b) => {
      if (sortBy === 'az') {
        const aText = a.text_soal || '';
        const bText = b.text_soal || '';
        return aText.localeCompare(bText);
      } else if (sortBy === 'za') {
        const aText = a.text_soal || '';
        const bText = b.text_soal || '';
        return bText.localeCompare(aText);
      } else if (sortBy === 'newest') {
        return b.id - a.id;
      } else {
        // default: oldest
        return a.id - b.id;
      }
    });
  }, [soals, sortBy]);

  const filteredSoals = sortedSoals
    .filter((soal) =>
      soal.text_soal?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((soal) => {
      if (filterType === 'all') return true;
      return soal.tipe === filterType;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSoals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSoals.length / itemsPerPage);

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="row mb-4">
          <div className="col">
            <div className="mb-3">
              <button 
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-sm fw-semibold" 
                onClick={() => {
                  if (sectionSlug) {
                    navigate(`/${sectionSlug}/levels`);
                  } else {
                    navigate('/homepage');
                  }
                }} 
                title="Kembali"
              >
                <i className="bi bi-arrow-left me-2"></i> Kembali
              </button>
            </div>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="fw-bold mb-1">Daftar Soal {levelName ? `- ${levelName}` : ''}</h1>
                <p className="text-muted mb-0">Manajemen Soal</p>
              </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-success rounded-pill px-4"
                onClick={() => {
                  localStorage.setItem("current_level_id", id_level);
                  navigate("/add-soal-pg");
                }}
              >
                + Tambah Soal PG
              </button>
              <button
                className="btn btn-success rounded-pill px-4"
                onClick={() => {
                  localStorage.setItem("current_level_id", id_level);
                  navigate("/soal-esai/add");
                }}
              >
                + Tambah Soal Esai
              </button>
            </div>
            </div>
          </div>
        </div>

        <div className="row mb-3 align-items-center">
          <div className="col-md-4 d-flex align-items-center">
            <h5 className="fw-semibold mb-0 text-primary">Total: {filteredSoals.length} Soal</h5>
          </div>
          <div className="col-md-8 d-flex justify-content-md-end gap-3 align-items-center flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold text-nowrap">Filter Tipe:</span>
              <select 
                className="form-select bg-white border-light rounded-pill px-3 fw-semibold text-secondary shadow-sm" 
                style={{ width: '130px', cursor: 'pointer', fontSize: '14px' }}
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">Semua</option>
                <option value="esai">Esai</option>
                <option value="pg">PG</option>
              </select>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold text-nowrap">Urutkan:</span>
              <select 
                className="form-select bg-white border-light rounded-pill px-3 fw-semibold text-secondary shadow-sm" 
                style={{ width: '150px', cursor: 'pointer', fontSize: '14px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="oldest">Terlama</option>
                <option value="newest">Terbaru</option>
                <option value="az">Nama A - Z</option>
                <option value="za">Nama Z - A</option>
              </select>
            </div>
            <input
              type="text"
              className="form-control rounded-pill shadow-sm"
              style={{ width: '250px' }}
              placeholder="Cari teks soal..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase small">
                <tr>
                  <th className="px-4 py-3 text-center" style={{ width: "80px" }}>No</th>
                  <th className="px-4 py-3" style={{ width: "120px" }}>Tipe</th>
                  <th className="px-4 py-3">Pertanyaan</th>
                  <th className="px-4 py-3 text-center" style={{ width: "250px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary" /></td></tr>
                ) : error ? (
                  <tr><td colSpan="4" className="text-center text-danger py-4">{error}</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-4 text-muted">Belum ada soal ditambahkan.</td></tr>
                ) : (
                  currentItems.map((soal, index) => (
                    <tr key={`${soal.tipe}-${soal.id}`}>
                      <td className="px-4 text-center">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4">
                        <span className={`badge rounded-pill ${soal.tipe === 'esai' ? 'bg-primary' : 'bg-success'}`}>
                          {soal.tipe.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4">
                        <div className="text-wrap" style={{ fontSize: "0.95rem" }}>
                          {soal.text_soal}
                        </div>
                      </td>
                      <td className="px-4 text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => navigate(`/soal-${soal.tipe}/detail/${soal.id}`)}>Detil</button>
                          <button className="btn btn-sm btn-outline-warning rounded-pill px-3" onClick={() => navigate(`/soal-${soal.tipe}/edit/${soal.id}`)}>Ubah</button>
                          <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDeleteClick(soal)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white py-3 px-4 border-top">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="text-muted small mb-2 mb-md-0">
                Menampilkan {filteredSoals.length > 0 ? indexOfFirstItem + 1 : 0} ke {Math.min(indexOfLastItem, filteredSoals.length)} dari {filteredSoals.length} data
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
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        &lt;
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => prev + 1)}
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

      {showDeleteModal && (
        <>
          <div className="modal-backdrop show"></div>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow rounded-4">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold">Konfirmasi Hapus</h5>
                  <button className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                </div>
                <div className="modal-body py-0">
                  Apakah anda yakin ingin menghapus soal <strong>{selectedSoal?.tipe.toUpperCase()}</strong> ini?
                </div>
                <div className="modal-footer border-0">
                  <button className="btn btn-light rounded-pill px-4" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>Batal</button>
                  <button className="btn btn-danger rounded-pill px-4" onClick={handleConfirmDelete} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Menghapus...
                      </>
                    ) : (
                      "Ya, Hapus"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ListSoal;