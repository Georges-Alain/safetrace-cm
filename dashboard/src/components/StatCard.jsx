import theme from '../theme';

export default function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: theme.colors.surface,
      border: `1px solid ${theme.colors.border}`,
      borderLeft: `4px solid ${color}`,
      borderRadius: theme.radius.lg,
      padding: '1.5rem',
    }}>
      <p style={{
        color: theme.colors.textMuted,
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '0.875rem',
        margin: 0,
      }}>
        {label}
      </p>
      <p style={{
        color: theme.colors.text,
        fontFamily: 'Syne, sans-serif',
        fontWeight: 800,
        fontSize: '2rem',
        margin: '0.5rem 0 0',
      }}>
        {value}
      </p>
    </div>
  );
}
