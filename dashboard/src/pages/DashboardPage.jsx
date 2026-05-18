import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../api/admin.api';
import StatCard from '../components/StatCard';
import theme from '../theme';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: adminAPI.getStats,
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800,
        color: theme.colors.text, fontSize: '1.75rem', margin: '0 0 2rem',
      }}>
        Tableau de bord
      </h2>

      {isLoading ? (
        <p style={{ color: theme.colors.textMuted, fontFamily: 'DM Sans, sans-serif' }}>
          Chargement...
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          <StatCard label="Cas actifs" value={stats?.active ?? 0} color={theme.colors.danger} />
          <StatCard label="En attente" value={stats?.pending ?? 0} color={theme.colors.warning} />
          <StatCard label="Résolus" value={stats?.resolved ?? 0} color={theme.colors.success} />
          <StatCard label="Taux de résolution" value={`${stats?.resolutionRate ?? 0}%`} color={theme.colors.police} />
        </div>
      )}
    </div>
  );
}
