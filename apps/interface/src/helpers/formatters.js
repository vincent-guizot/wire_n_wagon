export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'Rp 0';
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatRouteType = (type) => {
  if (!type) return '';
  return type.replace('_', ' ').toUpperCase();
};
