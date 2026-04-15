// src/utils/formatters.js

export const formatRupiah = (value) => {
  if (value === null || value === undefined || value === '') return '';
  // Pastikan jadi string dan ambil angka saja
  const numberString = value.toString().replace(/[^0-9]/g, '');
  // Tambahkan titik setiap 3 digit
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseNumber = (formattedValue) => {
  if (!formattedValue) return 0;
  // Hapus semua titik agar jadi angka murni
  const cleanValue = formattedValue.toString().replace(/\./g, '');
  return parseInt(cleanValue, 10) || 0;
};