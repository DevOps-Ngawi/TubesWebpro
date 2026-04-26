import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./styles/ListLevel.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import AddLevelModal from "../components/AddLevelModal";
import UpdateLevelModal from "../components/UpdateLevelModal";
import DeleteLevelModal from "../components/DeleteLevelModal";

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
  const [newLevelName, setNewLevelName] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLevelName, setUpdateLevelName] = useState("");
  const [updateSectionId, setUpdateSectionId] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleUpdateClick = (level) => {
    setSelectedLevel(level);
    setUpdateLevelName(level.nama_level);
    setUpdateSectionId(level?.id_section || "");
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (level) => {
    setSelectedLevel(level);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLevel) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3030/api/levels/${selectedLevel.id}`,
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
    }
  };

  const fetchLevels = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3030/api/${slugSection}/levels`, {
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
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3030/api/levels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama: newLevelName,
          idSection: selectedSectionId,
        }),
      });

      const responseJson = await response.json();

      if (responseJson?.payload?.statusCode !== 200) {
        throw new Error(responseJson.payload.message);
      }

      await fetchLevels();

      setShowAddModal(false);
      setNewLevelName("");
      setSelectedSectionId("");

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
    }
  };

  const handleUpdateLevel = async () => {
    try {
      if (!updateLevelName || !updateSectionId) {
        throw new Error("Nama level dan section wajib diisi");
      }
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3030/api/levels/${selectedLevel.id}`,
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
    }
  };

  const filteredLevels = levels.filter((level) => {
    const levelName = level.nama_level?.toLowerCase() || "";
    const sectionName = level.nama_section?.toLowerCase() || "";
    const keyword = searchTerm.toLowerCase();

    return levelName.includes(keyword) || sectionName.includes(keyword);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLevels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLevels.length / itemsPerPage);

  useEffect(() => {
    fetchLevels();
    const fetchSections = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("http://localhost:3030/api/sections", {
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

    fetchLevels();
    fetchSections();
  }, [navigate]);

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="row mb-4 align-items-center">
          <div className="col d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold mb-1">Daftar Level</h1>
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

        <div className="row mb-3 align-items-center">
          <div className="col-md-6">
            <h5 className="fw-semibold mb-2 mb-md-0">Daftar Level Terbaru</h5>
          </div>

          <div className="col-md-6 d-flex justify-content-md-end">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Cari level, section..."
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
                  <th className="px-4 py-3">Section</th>
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
      />
      <AddLevelModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddLevel}
        newLevelName={newLevelName}
        setNewLevelName={setNewLevelName}
        sections={sections}
        selectedSectionId={selectedSectionId}
        setSelectedSectionId={setSelectedSectionId}
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
      />
    </>
  );
};

export default LevelPage;
