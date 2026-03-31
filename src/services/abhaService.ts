// Utility helpers — no mock data, no scraping.
// All patient data comes from the VDocs backend via apiService.ts.

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    Active: 'success',
    Chronic: 'warning',
    Resolved: 'info',
    Completed: 'info',
    Discontinued: 'danger',
    Pending: 'warning',
    Expired: 'danger',
    Normal: 'success',
    Low: 'warning',
    High: 'warning',
    Critical: 'danger',
    Mild: 'success',
    Moderate: 'warning',
    Severe: 'danger'
  };
  return statusColors[status] || 'info';
}
