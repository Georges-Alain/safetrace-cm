import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casesAPI } from '../api/cases.api';
import { generateCasePDF } from '../utils/pdf';
import Badge from '../components/Badge';
import theme from '../theme';

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <span style={{
        display: 'block', color: theme.colors.textMuted,
        fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem',
      }}>
        {label}
      </span>
      <span style={{ color: theme.colors.text, fontFamily: 'DM Sans, sans-serif' }}>
        {value}
      </span>
    </div>
  );
}

function ActionBtn({ color, onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: `${color}20`,
        color,
        border: `1px solid ${color}50`,
        borderRadius: theme.radius.md,
        padding: '0.625rem 1.25rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 500,
        fontSize: '0.875rem',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

export default function CaseDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: c, isLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => casesAPI.getById(id),
  });

  const { data: testimonyData } = useQuery({
    queryKey: ['testimonies', id],
    queryFn: () => casesAPI.getTestimonies(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status) => casesAPI.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case', id] }),
  });

  const resolveMutation = useMutation({
    mutationFn: () => casesAPI.resolve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case', id] }),
  });

  if (isLoading) {
    return <p style={{ padding: '2rem', color: theme.colors.textMuted, fontFamily: 'DM Sans, sans-serif' }}>Chargement...</p>;
  }
  if (!c) {
    return <p style={{ padding: '2rem', color: theme.colors.danger, fontFamily: 'DM Sans, sans-serif' }}>Dossier introuvable</p>;
  }

  const testimonies = testimonyData?.testimonies ?? [];
  const isPending = statusMutation.isPending || resolveMutation.isPending;

  return (
    <div style={{ padding: '2rem', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          color: theme.colors.text, fontSize: '1.75rem', margin: 0,
        }}>
          {c.person_name}
        </h2>
        <Badge status={c.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: c.photo_url ? '280px 1fr' : '1fr', gap: '2rem', marginBottom: '2rem' }}>
        {c.photo_url && (
          <img
            src={c.photo_url}
            alt={c.person_name}
            style={{ width: '100%', borderRadius: theme.radius.lg, objectFit: 'cover', maxHeight: 320 }}
          />
        )}
        <div>
          <InfoRow label="Âge" value={`${c.person_age} ans`} />
          <InfoRow label="Sexe" value={c.person_gender === 'M' ? 'Masculin' : 'Féminin'} />
          <InfoRow label="Dernier lieu vu" value={c.last_seen_location} />
          <InfoRow label="Heure disparition" value={new Date(c.last_seen_at).toLocaleString('fr-FR')} />
          <InfoRow label="Description" value={c.description} />
          <InfoRow label="Signalé le" value={new Date(c.created_at).toLocaleDateString('fr-FR')} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {c.status === 'PENDING' && (
          <ActionBtn color={theme.colors.success} onClick={() => statusMutation.mutate('ACTIVE')} disabled={isPending}>
            Valider
          </ActionBtn>
        )}
        {(c.status === 'PENDING' || c.status === 'ACTIVE') && (
          <ActionBtn color={theme.colors.warning} onClick={() => statusMutation.mutate('INQUIRY')} disabled={isPending}>
            Marquer urgent
          </ActionBtn>
        )}
        {c.status === 'PENDING' && (
          <ActionBtn color={theme.colors.textMuted} onClick={() => statusMutation.mutate('PENDING')} disabled={isPending}>
            Demander révision
          </ActionBtn>
        )}
        {c.status !== 'RESOLVED' && (
          <ActionBtn color={theme.colors.success} onClick={() => resolveMutation.mutate()} disabled={isPending}>
            Marquer résolu
          </ActionBtn>
        )}
        <ActionBtn
          color={theme.colors.police}
          onClick={() => generateCasePDF(c, testimonies)}
        >
          Exporter PDF
        </ActionBtn>
      </div>

      <h3 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700,
        color: theme.colors.text, marginBottom: '1rem',
      }}>
        Témoignages ({testimonies.length})
      </h3>
      {testimonies.length === 0 && (
        <p style={{ color: theme.colors.textMuted, fontFamily: 'DM Sans, sans-serif' }}>
          Aucun témoignage pour ce dossier.
        </p>
      )}
      {testimonies.map((t) => (
        <div key={t.id} style={{
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.md,
          padding: '1rem',
          marginBottom: '0.75rem',
        }}>
          <p style={{ color: theme.colors.text, fontFamily: 'DM Sans, sans-serif', margin: '0 0 0.5rem' }}>
            {t.content}
          </p>
          {t.photo_url && (
            <img src={t.photo_url} alt="Témoignage" style={{ maxWidth: 200, borderRadius: 6, marginBottom: '0.5rem' }} />
          )}
          <p style={{ color: theme.colors.textMuted, fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', margin: 0 }}>
            {new Date(t.created_at).toLocaleString('fr-FR')}
          </p>
        </div>
      ))}
    </div>
  );
}
