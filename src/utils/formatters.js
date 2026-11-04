export const formatRupiah = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const numberString = value.toString().replace(/[^0-9]/g, '');
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const formatNominal = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0).replace('IDR', 'Rp ').replace(/\s/g, ' ');
};

export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseNumber = (formattedValue) => {
  if (!formattedValue) return 0;
  const cleanValue = formattedValue.toString().replace(/\./g, '');
  return parseInt(cleanValue, 10) || 0;
};

export const getFinancialRange = (payday = 1) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  // Sebelum tanggal gajian, periode aktif masih milik bulan sebelumnya.
  const startDate = date < payday
    ? new Date(year, month - 1, payday)
    : new Date(year, month, payday);

  // Periode berakhir sehari sebelum gajian berikutnya.
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  endDate.setHours(23, 59, 59, 999);

  const formatLocal = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    start: formatLocal(startDate),
    end: formatLocal(endDate)
  };
};
