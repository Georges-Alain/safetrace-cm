import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import theme from '../theme';

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);
const MapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const NAV_ITEMS = [
  { to: '/', label: 'Tableau de bord', Icon: GridIcon },
  { to: '/cases', label: 'Dossiers', Icon: FolderIcon },
  { to: '/map', label: 'Carte', Icon: MapIcon },
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <nav style={{
      width: 240,
      background: theme.colors.surface,
      borderRight: `1px solid ${theme.colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      flexShrink: 0,
    }}>
      <div style={{ padding: '1.75rem 1.5rem 1.5rem' }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.25rem', color: theme.colors.text, margin: 0,
        }}>
          SafeTrace
        </h1>
        <p style={{
          color: theme.colors.police, fontSize: '0.75rem',
          margin: '0.25rem 0 0', fontFamily: 'DM Sans, sans-serif',
        }}>
          Forces de l'Ordre
        </p>
      </div>

      <div style={{ flex: 1 }}>
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              textDecoration: 'none',
              color: isActive ? theme.colors.police : theme.colors.textMuted,
              background: isActive ? 'rgba(167,139,250,0.08)' : 'transparent',
              borderRight: isActive ? `2px solid ${theme.colors.police}` : '2px solid transparent',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 500,
              fontSize: '0.9rem',
            })}
          >
            <Icon /> {label}
          </NavLink>
        ))}
      </div>

      <div style={{
        padding: '1rem 1.5rem',
        borderTop: `1px solid ${theme.colors.border}`,
      }}>
        <p style={{ color: theme.colors.textMuted, fontSize: '0.75rem', marginBottom: '0.5rem', fontFamily: 'DM Sans, sans-serif' }}>
          {user?.role ?? 'OFFICER'}
        </p>
        <button
          onClick={logout}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textMuted,
            borderRadius: theme.radius.md,
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.875rem',
            width: '100%',
          }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
