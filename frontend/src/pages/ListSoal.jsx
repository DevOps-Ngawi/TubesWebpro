import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./styles/ListLevel.css";

const ListSoal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id_level } = useParams();

  const [soals, setSoals] = useState([]);
  const [levelName, setLevelName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSoal, setSelectedSoal] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type: type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    if (location.state?.message) {
      const msg = location.state.message.toLowerCase();
      let type = "success";

      if (msg.includes("ubah") || msg.includes("edit")) {
        type = "warning text-dark";
      }

      showToast(location.state.message, type);
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
          const namaLevel = result.payload?.datas?.nama;
          if (namaLevel) {
            setLevelName(namaLevel);
          } else {
            setLevelName("Level " + id_level);
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
        showToast(`Soal ${selectedSoal.tipe.toUpperCase()} berhasil dihapus`, "danger");
      } else {
        showToast("Gagal menghapus soal", "danger");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi.", "danger");
    }
  };

  const filteredSoals = soals.filter((soal) =>
    soal.text_soal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSoals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSoals.length / itemsPerPage);

  return (
    <>
      <Navbar />
      {toast.show && (
        <div
          className="position-fixed w-100 d-flex justify-content-end"
          style={{ top: "107px", right: "2%" }}
        >
          <div className={`toast show align-items-center text-white bg-${toast.type} border-0 shadow-lg`}>
            <div className="d-flex">
              <div className="toast-body fw-bold">
                {toast.message}
              </div>
              <button
                type="button"
                className={`btn-close ${toast.type.includes('warning') ? '' : 'btn-close-white'} me-2 m-auto`}
                onClick={() => setToast({ ...toast, show: false })}
              ></button>
            </div>
          </div>
        </div>
      )}

      <div className="container mt-5">
        <div className="row mb-4 align-items-center">
          <div className="col d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="fw-bold mb-1">Daftar Soal {levelName}</h1>
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

        <div className="row mb-3">
          <div className="col-md-6 d-flex align-items-center">
            <h5 className="fw-semibold mb-0 text-primary">Total: {filteredSoals.length} Soal</h5>
          </div>
          <div className="col-md-6 d-flex justify-content-md-end">
            <input
              type="text"
              className="form-control rounded-pill w-75 shadow-sm"
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
                  <button className="btn btn-light rounded-pill px-4" onClick={() => setShowDeleteModal(false)}>Batal</button>
                  <button className="btn btn-danger rounded-pill px-4" onClick={handleConfirmDelete}>Ya, Hapus</button>
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