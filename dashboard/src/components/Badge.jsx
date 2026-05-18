const STATUS_CONFIG = {
  PENDING:  { text: '#f97316', label: 'En attente' },
  ACTIVE:   { text: '#ef4444', label: 'Actif' },
  INQUIRY:  { text: '#a78bfa', label: 'Enquête' },
  RESOLVED: { text: '#22c55e', label: 'Résolu' },
};

export default function Badge({ status }) {
  const { text, label } = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span style={{
      background: '#1e293b',
      color: text,
      padding: '0.25rem 0.75rem',
      borderRadius: 20,
      fontSize: '0.75rem',
      fontFamily: 'DM Sans, sans-serif',
      fontWeight: 500,
      border: `1px solid ${text}30`,
      display: 'inline-block',
    }}>
      {label}
    </span>
  );
}
