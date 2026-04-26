import React from 'react';

const TablePagination = ({ 
  totalData, 
  startIndex, 
  endIndex, 
  rowsPerPage, 
  onRowsChange, 
  currentPage, 
  totalPages, 
  onPageChange 
}) => (
  <div className="card-footer bg-white border-top py-3 px-4">
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
      <div className="text-muted small mb-2 mb-md-0">
        Menampilkan {totalData > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, totalData)} dari {totalData} data
      </div>
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center">
          <label className="me-2 small text-muted">Baris:</label>
          <select className="form-select form-select-sm" style={{ width: '70px' }} value={rowsPerPage} onChange={onRowsChange}>
            {[5, 10, 25].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link rounded-start-pill" onClick={() => onPageChange(currentPage - 1)}>&lt;</button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button className="page-link rounded-end-pill" onClick={() => onPageChange(currentPage + 1)}>&gt;</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
);

export default TablePagination;