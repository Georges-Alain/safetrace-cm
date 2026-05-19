import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { casesAPI } from '../api/cases.api';
import Badge from '../components/Badge';
import theme from '../theme';

const TABS = [
  { label: 'Actifs',  status: 'ACTIVE' },
  { label: 'Urgents', status: 'INQUIRY' },
  { label: 'Résolus', status: 'RESOLVED' },
];

const TH = ({ children }) => (
  <th style={{
    textAlign: 'left', padding: '0.75rem 1rem',
    color: theme.colors.textMuted, fontSize: '0.75rem',
    fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em',
  }}>
    {children}
  </th>
);

const TD = ({ children, style }) => (
  <td style={{ padding: '1rem', fontFamily: 'DM Sans, sans-serif', ...style }}>
    {children}
  </td>
);

export default function CasesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['cases', TABS[activeTab].status],
    queryFn: () => casesAPI.list({ status: TABS[activeTab].status, limit: 50, offset: 0 }),
  });

  const validateMutation = useMutation({
    mutationFn: ({ id, status }) => casesAPI.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800,
        color: theme.colors.text, fontSize: '1.75rem', margin: '0 0 1.5rem',
      }}>
        Dossiers
      </h2>

      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${theme.colors.border}`, marginBottom: '1.5rem' }}>
        {TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.75rem 1.25rem',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 500,
              fontSize: '0.9rem',
              color: activeTab === i ? theme.colors.police : theme.colors.textMuted,
              borderBottom: activeTab === i ? `2px solid ${theme.colors.police}` : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p style={{ color: theme.colors.textMuted, fontFamily: 'DM Sans, sans-serif' }}>Chargement...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                <TH>Nom</TH><TH>Âge</TH><TH>Lieu</TH><TH>Date</TH><TH>Statut</TH><TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {(data?.cases ?? []).map((c) => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${theme.colors.border}20` }}>
                  <TD style={{ color: theme.colors.text }}>{c.person_name}</TD>
                  <TD style={{ color: theme.colors.textMuted }}>{c.person_age} ans</TD>
                  <TD style={{ color: theme.colors.textMuted }}>{c.last_seen_location}</TD>
                  <TD style={{ color: theme.colors.textMuted }}>
                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </TD>
                  <TD><Badge status={c.status} /></TD>
                  <TD>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link
                        to={`/cases/${c.id}`}
                        style={{ color: theme.colors.police, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
                      >
                        Voir
                      </Link>
                      {c.status === 'ACTIVE' && (
                        <button
                          onClick={() => validateMutation.mutate({ id: c.id, status: 'INQUIRY' })}
                          style={{
                            background: `${theme.colors.warning}20`,
                            color: theme.colors.warning,
                            border: 'none',
                            borderRadius: 6,
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif',
                          }}
                        >
                          Marquer urgent
                        </button>
                      )}
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>

          {(data?.cases ?? []).length === 0 && (
            <p style={{
              color: theme.colors.textMuted,
              textAlign: 'center',
              padding: '3rem',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              Aucun dossier dans cet onglet
            </p>
          )}
        </div>
      )}
    </div>
  );
}
