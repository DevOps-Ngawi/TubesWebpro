import { useState, useMemo } from 'react';

export const useTable = (data, searchFields, initialRows = 5) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRows);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  const getNestedValue = (obj, path) =>
    path.split('.').reduce((acc, k) => acc?.[k], obj);

  const filteredData = useMemo(() =>
    data.filter((item) =>
      searchFields.some((field) => {
        const value = getNestedValue(item, field);
        return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
      })
    ), [data, searchFields, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = getNestedValue(a, sortConfig.key) ?? '';
      const bVal = getNestedValue(b, sortConfig.key) ?? '';
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      const isNumeric = !isNaN(aNum) && !isNaN(bNum) && aVal !== '' && bVal !== '';
      const cmp = isNumeric
        ? aNum - bNum
        : String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase());
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return {
    searchTerm,
    handleSearch,
    currentPage,
    handlePageChange,
    rowsPerPage,
    handleRowsChange,
    currentItems,
    totalPages,
    filteredCount: sortedData.length,
    filteredData,
    indexOfFirstItem,
    sortConfig,
    handleSort,
  };
};
