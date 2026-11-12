export const formatPower = (mw) => {
  if (mw === undefined || mw === null) return '-- MW';
  return `${Number(mw).toFixed(1)} MW`;
};

export const formatSpeed = (ms) => {
  if (ms === undefined || ms === null) return '-- m/s';
  return `${Number(ms).toFixed(1)} m/s`;
};

export const formatRPM = (rpm) => {
  if (rpm === undefined || rpm === null) return '-- RPM';
  return `${Number(rpm).toFixed(1)} RPM`;
};

export const formatTemp = (deg) => {
  if (deg === undefined || deg === null) return '--°C';
  return `${Math.round(deg)}°C`;
};

export const formatPercent = (val) => {
  if (val === undefined || val === null) return '--%';
  return `${Number(val).toFixed(1)}%`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const past = new Date(dateStr);
  const diffMinutes = Math.floor((now - past) / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};
