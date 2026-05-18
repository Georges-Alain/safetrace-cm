import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import theme from '../theme';

const labelStyle = {
  display: 'block',
  color: '#94a3b8',
  fontSize: '0.875rem',
  marginBottom: '0.375rem',
  fontFamily: 'DM Sans, sans-serif',
};

const inputStyle = {
  display: 'block',
  width: '100%',
  background: '#080c14',
  border: '1px solid #1e2a3a',
  borderRadius: 8,
  color: '#f1f5f9',
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  fontFamily: 'DM Sans, sans-serif',
  marginBottom: '1rem',
  boxSizing: 'border-box',
};

const btnPrimaryStyle = {
  display: 'block',
  width: '100%',
  background: theme.colors.police,
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '0.875rem',
  fontSize: '1rem',
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 500,
  cursor: 'pointer',
  marginBottom: '0.5rem',
};

const btnGhostStyle = {
  ...btnPrimaryStyle,
  background: 'transparent',
  border: `1px solid ${theme.colors.border}`,
  color: theme.colors.textMuted,
};

const errorStyle = {
  color: theme.colors.danger,
  fontSize: '0.875rem',
  marginBottom: '1rem',
  fontFamily: 'DM Sans, sans-serif',
};

export default function LoginPage() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handlePhone = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.register(phone, name);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.verifyOtp(phone, code);
      if (data.user.role !== 'OFFICER' && data.user.role !== 'ADMIN') {
        setError("Accès réservé aux forces de l'ordre");
        return;
      }
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: '2.5rem',
        width: '100%',
        maxWidth: 400,
        border: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: theme.colors.police,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '1.5rem', color: theme.colors.text, margin: 0,
          }}>
            SafeTrace Police
          </h1>
          <p style={{ color: theme.colors.textMuted, marginTop: '0.5rem', fontFamily: 'DM Sans, sans-serif' }}>
            Dashboard Forces de l'Ordre
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handlePhone}>
            <label style={labelStyle}>Nom complet</label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sgt. Jean Dupont"
              required
            />
            <label style={labelStyle}>Numéro MTN / Orange</label>
            <input
              style={inputStyle}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+237 6XX XXX XXX"
              type="tel"
              required
            />
            {error && <p style={errorStyle}>{error}</p>}
            <button type="submit" style={btnPrimaryStyle} disabled={loading}>
              {loading ? 'Envoi...' : 'Recevoir le code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtp}>
            <p style={{ color: theme.colors.textMuted, marginBottom: '1.5rem', fontFamily: 'DM Sans, sans-serif' }}>
              Code envoyé au {phone}
            </p>
            <label style={labelStyle}>Code OTP (6 chiffres)</label>
            <input
              style={{ ...inputStyle, letterSpacing: '0.3rem', fontSize: '1.5rem', textAlign: 'center' }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              required
            />
            {error && <p style={errorStyle}>{error}</p>}
            <button type="submit" style={btnPrimaryStyle} disabled={loading}>
              {loading ? 'Vérification...' : 'Se connecter'}
            </button>
            <button type="button" style={btnGhostStyle} onClick={() => setStep('phone')}>
              Changer de numéro
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
