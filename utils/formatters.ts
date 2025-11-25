export const formatIndonesianCurrency = (price: number): string => {
  if (price >= 1000000) {
    const millions = price / 1000000;
    // Format to one decimal place if not a whole number, using a comma for the decimal
    const formatted = (millions % 1 === 0) 
      ? millions.toString() 
      : millions.toFixed(1).replace('.', ',');
    return `Rp${formatted} Jt`;
  }
  if (price >= 1000) {
    const thousands = price / 1000;
    // Format to one decimal place if not a whole number, using a comma for the decimal
    const formatted = (thousands % 1 === 0) 
      ? thousands.toString() 
      : thousands.toFixed(1).replace('.', ',');
    return `Rp${formatted}K`;
  }
  // Use standard formatting for smaller amounts
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

export const formatCount = (count: number | undefined): string => {
  if (count === undefined || count === null) return '0';
  if (count >= 1000000) {
    const millions = count / 1000000;
    return (millions % 1 === 0 ? millions.toString() : millions.toFixed(1)) + 'm';
  }
  if (count >= 1000) {
    const thousands = count / 1000;
    return (thousands % 1 === 0 ? thousands.toString() : thousands.toFixed(1)) + 'k';
  }
  return count.toString();
};