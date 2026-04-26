import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TablePagination from '../components/TablePagination';
import { useTable } from '../hooks/useTable';
import './styles/ReviewAttempt.css';

const SortIcon = ({ colKey, sortConfig }) => {
  if (sortConfig.key !== colKey) {
    return <span className="ms-1" style={{ opacity: 0.35, fontSize: '0.75rem' }}>⇅</span>;
  }
  return (
    <span className="ms-1" style={{ fontSize: '0.75rem' }}>
      {sortConfig.direction === 'asc' ? '↑' : '↓'}
    </span>
  );
};

export default function ReviewAttempt() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    filteredData,
    indexOfFirstItem,
    sortConfig,
    handleSort,
  } = useTable(attempts, ['pelajars.username', 'levels.nama', 'levels.sections.nama'], 10);

  const stats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { totalAttempts: 0, averageScore: 0, lowestAvgLevel: '-', lowestAvgScore: 0 };
    }

    const totalAttempts = filteredData.length;
    const averageScore = filteredData.reduce((sum, a) => sum + Number(a.skor || 0), 0) / totalAttempts;

    const levelMap = {};
    filteredData.forEach((a) => {
      const levelName = a.levels?.nama || 'Unknown';
      const sectionName = a.levels?.sections?.nama || 'Tanpa Section';
      const key = `${levelName} (${sectionName})`;
      if (!levelMap[key]) levelMap[key] = [];
      levelMap[key].push(Number(a.skor || 0));
    });

    let lowestAvgLevel = '-';
    let lowestAvgScore = Infinity;
    Object.entries(levelMap).forEach(([level, scores]) => {
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      if (avg < lowestAvgScore) {
        lowestAvgScore = avg;
        lowestAvgLevel = level;
      }
    });

    return {
      totalAttempts,
      averageScore,
      lowestAvgLevel,
      lowestAvgScore: lowestAvgScore === Infinity ? 0 : lowestAvgScore,
    };
  }, [filteredData]);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attempts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Gagal memuat data attempt.");

      const data = await response.json();
      const payloadData = data.payload?.datas;
      setAttempts(payloadData?.attempts || payloadData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    const numScore = Number(score);
    return numScore >= 75 ? 'text-success' : 'text-danger';
  };

  const sortableHeaderStyle = {
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="mb-4">
          <h1 className="fw-bold mb-1">Review Attempt</h1>
          <p className="text-muted">Tinjau hasil pengerjaan siswa secara real-time</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="dash-card dash-blue">
              <div className="dash-content">
                <div className="dash-number">{stats.totalAttempts}</div>
                <div className="dash-label">Total Attempt</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dash-card dash-purple">
              <div className="dash-content">
                <div className="dash-number">{stats.averageScore.toFixed(2)}</div>
                <div className="dash-label">Rata-rata Skor</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dash-card dash-orange">
              <div className="dash-content">
                <div className="dash-number" style={{ fontSize: '1.2rem' }}>{stats.lowestAvgLevel}</div>
                <div className="dash-label">Skor Terendah: {stats.lowestAvgScore.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 px-4 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Attempt Terbaru</h5>
              <input
                type="text"
                className="form-control bg-light border-0 rounded-pill w-25"
                placeholder="Cari siswa/level..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 small fw-bold">NO</th>
                  <th
                    className="px-4 py-3 small fw-bold"
                    style={sortableHeaderStyle}
                    onClick={() => handleSort('pelajars.username')}
                  >
                    USERNAME <SortIcon colKey="pelajars.username" sortConfig={sortConfig} />
                  </th>
                  <th
                    className="px-4 py-3 small fw-bold"
                    style={sortableHeaderStyle}
                    onClick={() => handleSort('levels.nama')}
                  >
                    LEVEL <SortIcon colKey="levels.nama" sortConfig={sortConfig} />
                  </th>
                  <th
                    className="px-4 py-3 small fw-bold"
                    style={sortableHeaderStyle}
                    onClick={() => handleSort('levels.sections.nama')}
                  >
                    SECTION <SortIcon colKey="levels.sections.nama" sortConfig={sortConfig} />
                  </th>
                  <th
                    className="px-4 py-3 small fw-bold"
                    style={sortableHeaderStyle}
                    onClick={() => handleSort('skor')}
                  >
                    SKOR <SortIcon colKey="skor" sortConfig={sortConfig} />
                  </th>
                  <th className="px-4 py-3 small fw-bold text-end">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">Tidak ada data.</td></tr>
                ) : (
                  currentItems.map((attempt, index) => (
                    <tr key={attempt.id}>
                      <td className="px-4">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 fw-bold">{attempt.pelajars?.username || '-'}</td>
                      <td className="px-4"><span className="badge bg-light text-dark border">{attempt.levels?.nama || '-'}</span></td>
                      <td className="px-4 text-muted">{attempt.levels?.sections?.nama || '-'}</td>
                      <td className={`px-4 fw-bold ${getScoreClass(attempt.skor)}`}>
                        {Number(attempt.skor).toFixed(2)}
                      </td>
                      <td className="px-4 text-end">
                        <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => navigate(`/detail-attempt/${attempt.id}`)}>Detil</button>
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
}
