import i18n from '../i18n';

/**
 * Format salary for display
 */
export const formatSalary = (amount: number, period: string): string => {
  const formatted = new Intl.NumberFormat(i18n.language === 'en' ? 'en-IN' : i18n.language, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
  
  const periodLabel = i18n.t(`workerHome.${period}`, period);
  return `${formatted}/${periodLabel}`;
};

/**
 * Format relative time string
 */
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return i18n.t('common.justNow', 'Just now');
  if (diffMin < 60) return `${diffMin}${i18n.t('common.minAgo', 'm')} ${i18n.t('common.ago', 'ago')}`;
  if (diffHr < 24) return `${diffHr}${i18n.t('common.hrAgo', 'h')} ${i18n.t('common.ago', 'ago')}`;
  if (diffDay < 7) return `${diffDay}${i18n.t('common.dayAgo', 'd')} ${i18n.t('common.ago', 'ago')}`;
  if (diffWeek < 4) return `${diffWeek}${i18n.t('common.weekAgo', 'w')} ${i18n.t('common.ago', 'ago')}`;
  return date.toLocaleDateString(i18n.language === 'en' ? 'en-IN' : i18n.language, { day: 'numeric', month: 'short' });
};

/**
 * Format date nicely
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(i18n.language === 'en' ? 'en-IN' : i18n.language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get initials from a name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate text
 */
export const truncate = (str: string, len: number): string => {
  if (str.length <= len) return str;
  return str.slice(0, len) + '...';
};

/**
 * Get job type label
 */
export const getJobTypeLabel = (type: string): string => {
  const keyMap: Record<string, string> = {
    'full-time': 'fullTime',
    'part-time': 'partTime',
    'contract': 'contract',
    'daily': 'daily',
  };
  return i18n.t(`workerHome.${keyMap[type] || type}`, type);
};

/**
 * Get status color from theme
 */
export const getStatusColor = (
  status: string
): { bg: string; text: string } => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
    reviewed: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' },
    accepted: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
    rejected: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' },
  };
  return statusColors[status] || statusColors.pending;
};
