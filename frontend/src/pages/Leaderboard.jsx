import React, { useState, useEffect, useCallback } from "react";
import Navbar from '../components/Navbar';
import './styles/Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('global');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLevels = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/levels`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const levelData = json.payload?.datas || json.payload || [];
        setLevels(Array.isArray(levelData) ? levelData : []);
      }
    } catch (err) {
      console.error("Error fetching levels:", err);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedLevel === 'global' 
        ? `${import.meta.env.VITE_API_URL}/api/leaderboard`
        : `${import.meta.env.VITE_API_URL}/api/leaderboard/${selectedLevel}`;
      
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal mengambil data leaderboard");
      
      const json = await res.json();
      setLeaderboard(json.payload?.datas || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedLevel]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="rank-badge gold"><i className="bi bi-trophy-fill"></i></span>;
    if (rank === 2) return <span className="rank-badge silver"><i className="bi bi-trophy-fill"></i></span>;
    if (rank === 3) return <span className="rank-badge bronze"><i className="bi bi-trophy-fill"></i></span>;
    return <span className="rank-number">{rank}</span>;
  };

  return (
    <>
      <Navbar />
      <div className="leaderboard-container container mt-5 pb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-1">Leaderboard</h1>
            <p className="text-muted">10 Pelajar terbaik dengan rata-rata skor tertinggi</p>
          </div>
          <div className="filter-wrapper">
            <select 
              className="form-select rounded-pill px-4 border-0 shadow-sm"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="global">Global (Semua Level)</option>
              {levels.map(lvl => (
                <option key={lvl.id} value={lvl.id}>{lvl.nama} - {lvl.sections?.nama || 'Tanpa Section'}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-center small fw-bold">RANK</th>
                  <th className="px-4 py-3 small fw-bold">PELAJAR</th>
                  <th className="px-4 py-3 text-center small fw-bold">TOTAL ATTEMPT</th>
                  <th className="px-4 py-3 text-center small fw-bold">RATA-RATA SKOR</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                ) : (!Array.isArray(leaderboard) || leaderboard.length === 0) ? (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">Belum ada data pengerjaan.</td></tr>
                ) : (
                  leaderboard.map((student, index) => (
                    <tr key={student.id} className={index < 3 ? `top-rank rank-${index + 1}` : ''}>
                      <td className="px-4 text-center">
                        {getRankBadge(index + 1)}
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-circle">
                            {student.nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold">{student.nama}</div>
                            <div className="small text-muted">@{student.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 text-center">
                        <span className="badge bg-light text-dark border rounded-pill px-3">
                          {student.totalAttempts} Kali
                        </span>
                      </td>
                      <td className="px-4 text-center">
                        <div className="score-badge">
                          {student.averageScore.toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
