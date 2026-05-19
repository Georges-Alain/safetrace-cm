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
        color: theme.colors.text, fontSize: '1.75rem', margin: '0 0 0.5rem',
      }}>
        Tableau de bord
      </h2>
      <p style={{ color: theme.colors.textMuted, fontFamily: 'DM Sans, sans-serif', marginBottom: '2rem', fontSize: '0.875rem' }}>
        Suivi des dossiers en temps réel — les signalements sont publiés automatiquement.
      </p>

      {isLoading ? (
        <p style={{ color: theme.colors.textMuted, fontFamily: 'DM Sans, sans-serif' }}>
          Chargement...
        </p>
      ) : (
        <>
          <p style={{
            color: theme.colors.textMuted,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '1rem',
          }}>
            Dossiers
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            <StatCard label="Cas actifs" value={stats?.active ?? 0} color={theme.colors.danger} />
            <StatCard label="En attente" value={stats?.pending ?? 0} color={theme.colors.warning} />
            <StatCard label="Résolus" value={stats?.resolved ?? 0} color={theme.colors.success} />
            <StatCard label="Taux de résolution" value={`${stats?.resolutionRate ?? 0}%`} color={theme.colors.police} />
          </div>

          <p style={{
            color: theme.colors.textMuted,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '1rem',
          }}>
            Engagement communautaire
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}>
            <StatCard label="Réactions totales" value={stats?.reactions_total ?? 0} color="#f59e0b" />
            <StatCard label="Témoignages (7 jours)" value={stats?.testimonies_week ?? 0} color="#06b6d4" />
          </div>
        </>
      )}
    </div>
  );
}
