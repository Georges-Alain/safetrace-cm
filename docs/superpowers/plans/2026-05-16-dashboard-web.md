# Dashboard Web Police — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a restricted web dashboard (React + Vite) for Cameroonian police/gendarmerie to validate, manage, and close missing-person cases reported via the SafeTrace mobile app.

**Architecture:** Single-page app using React Router for navigation, React Query for server state, and Zustand for auth state. The dashboard communicates with the shared SafeTrace Node.js API and is restricted to officers/admins (role check on OTP verification + server-side IP whitelist on the API).

**Tech Stack:** React 18, Vite 5, React Router 6, @tanstack/react-query 5, Zustand 4, Axios, React Leaflet + Leaflet, jsPDF, Lucide React, Vitest + @testing-library/react

---

## File Structure

```
dashboard/
├── index.html                          # App shell — Google Fonts (Syne + DM Sans), CSS reset
├── vite.config.js                      # Vite + Vitest config, /api proxy to localhost:3000
├── package.json
├── src/
│   ├── main.jsx                        # ReactDOM.createRoot entry
│   ├── App.jsx                         # BrowserRouter, ProtectedRoute, ProtectedLayout, QueryClientProvider
│   ├── theme.js                        # Design tokens (colors, radius) — single source of truth
│   ├── setupTests.js                   # @testing-library/jest-dom import
│   ├── api/
│   │   ├── client.js                   # Axios instance + JWT request interceptor + 401 refresh interceptor
│   │   ├── auth.api.js                 # register(phone, name), verifyOtp(phone, code), refresh(token)
│   │   ├── cases.api.js                # list(params), getById(id), updateStatus(id, status), resolve(id), getTestimonies(id)
│   │   └── admin.api.js                # getStats(), getPendingCases()
│   ├── store/
│   │   └── auth.store.js              # Zustand: { user, isAuthenticated, login, logout, restoreSession }
│   ├── components/
│   │   ├── Badge.jsx                  # Status badge colored by case status (PENDING/ACTIVE/INQUIRY/RESOLVED)
│   │   ├── StatCard.jsx               # Stat display card with colored left border
│   │   └── Sidebar.jsx                # Nav sidebar: logo, 3 nav links, user role, logout
│   ├── pages/
│   │   ├── LoginPage.jsx              # Two-step form: phone+name → OTP; role guard (OFFICER/ADMIN only)
│   │   ├── DashboardPage.jsx          # Stats overview: 4 StatCards from /api/admin/stats
│   │   ├── CasesPage.jsx              # Tabbed table (À valider / En cours / Archivés) + validate action
│   │   ├── CaseDetailPage.jsx         # Single case: photo, info, action buttons, testimonies, PDF export
│   │   └── MapPage.jsx                # Leaflet map with colored markers by status + status filter
│   └── utils/
│       └── pdf.js                     # generateCasePDF(caseData, testimonies) → calls doc.save()
└── src/__tests__/
    ├── App.test.jsx
    ├── store/
    │   └── auth.store.test.js
    ├── components/
    │   ├── Badge.test.jsx
    │   └── StatCard.test.jsx
    ├── pages/
    │   ├── LoginPage.test.jsx
    │   ├── DashboardPage.test.jsx
    │   ├── CasesPage.test.jsx
    │   └── MapPage.test.jsx
    └── utils/
        └── pdf.test.js
```

---

## Task 1: Project Setup + Design Tokens

**Files:**
- Create: `dashboard/package.json`
- Create: `dashboard/vite.config.js`
- Create: `dashboard/index.html`
- Create: `dashboard/src/main.jsx`
- Create: `dashboard/src/App.jsx` (stub)
- Create: `dashboard/src/theme.js`
- Create: `dashboard/src/setupTests.js`
- Test: `dashboard/src/__tests__/App.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `dashboard/src/__tests__/App.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run
```

Expected: FAIL — `Cannot find module '../App'` (project doesn't exist yet)

- [ ] **Step 3: Scaffold the project**

```bash
cd /Users/georges/missing-persons-app
npm create vite@latest dashboard -- --template react
cd dashboard
npm install
npm install react-router-dom @tanstack/react-query zustand axios react-leaflet leaflet jspdf lucide-react
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 4: Create `dashboard/vite.config.js`** (replaces the generated one)

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
  },
});
```

- [ ] **Step 5: Create `dashboard/src/setupTests.js`**

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 6: Create `dashboard/src/theme.js`**

```js
export default {
  colors: {
    background: '#080c14',
    surface: '#0f1623',
    border: '#1e2a3a',
    text: '#f1f5f9',
    textMuted: '#64748b',
    orange: '#f97316',
    danger: '#ef4444',
    warning: '#f97316',
    success: '#22c55e',
    police: '#a78bfa',
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
};
```

- [ ] **Step 7: Create `dashboard/src/App.jsx`** (stub — full version in Task 4)

```jsx
export default function App() {
  return <div data-testid="app">SafeTrace Police</div>;
}
```

- [ ] **Step 8: Create `dashboard/src/main.jsx`**

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 9: Replace `dashboard/index.html`**

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SafeTrace Police</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #080c14; color: #f1f5f9; font-family: 'DM Sans', sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 10: Delete generated boilerplate**

```bash
cd /Users/georges/missing-persons-app/dashboard
rm -f src/App.css src/index.css src/assets/react.svg public/vite.svg
```

- [ ] **Step 11: Run test to verify it passes**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run
```

Expected: PASS — `renders without crashing`

- [ ] **Step 12: Commit**

```bash
cd /Users/georges/missing-persons-app
git add dashboard/
git commit -m "feat(dashboard): scaffold Vite/React project with design tokens"
```

---

## Task 2: API Client + Auth Store

**Files:**
- Create: `dashboard/src/api/client.js`
- Create: `dashboard/src/api/auth.api.js`
- Create: `dashboard/src/store/auth.store.js`
- Test: `dashboard/src/__tests__/store/auth.store.test.js`

- [ ] **Step 1: Write the failing test**

Create `dashboard/src/__tests__/store/auth.store.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../store/auth.store';

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it('login stores tokens and sets isAuthenticated', () => {
    useAuthStore.getState().login({ id: '1', role: 'OFFICER' }, 'acc', 'ref');
    expect(localStorage.getItem('access_token')).toBe('acc');
    expect(localStorage.getItem('refresh_token')).toBe('ref');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual({ id: '1', role: 'OFFICER' });
  });

  it('logout clears tokens and resets state', () => {
    localStorage.setItem('access_token', 'tok');
    useAuthStore.setState({ user: { id: '1' }, isAuthenticated: true });
    useAuthStore.getState().logout();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('restoreSession reads a valid non-expired JWT', () => {
    const payload = { sub: 'u1', role: 'OFFICER', exp: Math.floor(Date.now() / 1000) + 3600 };
    const token = `h.${btoa(JSON.stringify(payload))}.s`;
    localStorage.setItem('access_token', token);
    useAuthStore.getState().restoreSession();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user.role).toBe('OFFICER');
  });

  it('restoreSession clears an expired JWT', () => {
    const payload = { sub: 'u1', role: 'OFFICER', exp: Math.floor(Date.now() / 1000) - 10 };
    const token = `h.${btoa(JSON.stringify(payload))}.s`;
    localStorage.setItem('access_token', token);
    useAuthStore.getState().restoreSession();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/store/auth.store.test.js
```

Expected: FAIL — `Cannot find module '../../store/auth.store'`

- [ ] **Step 3: Create `dashboard/src/store/auth.store.js`**

```js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        set({ user: { id: payload.sub, role: payload.role }, isAuthenticated: true });
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },
}));
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/store/auth.store.test.js
```

Expected: PASS — all 4 tests green

- [ ] **Step 5: Create `dashboard/src/api/client.js`**

```js
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return client(original);
          });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const base = import.meta.env.VITE_API_URL || '';
        const { data } = await axios.post(`${base}/api/auth/refresh`, { refreshToken });
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        queue.forEach((p) => p.resolve(data.accessToken));
        queue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(original);
      } catch (e) {
        queue.forEach((p) => p.reject(e));
        queue = [];
        useAuthStore.getState().logout();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default client;
```

- [ ] **Step 6: Create `dashboard/src/api/auth.api.js`**

```js
import client from './client';

export const authAPI = {
  register: (phone, name) =>
    client.post('/api/auth/register', { phone, name }).then((r) => r.data),

  verifyOtp: (phone, code) =>
    client.post('/api/auth/verify-otp', { phone, code }).then((r) => r.data),

  refresh: (refreshToken) =>
    client.post('/api/auth/refresh', { refreshToken }).then((r) => r.data),
};
```

- [ ] **Step 7: Create `dashboard/src/api/cases.api.js`**

```js
import client from './client';

export const casesAPI = {
  list: (params) =>
    client.get('/api/cases', { params }).then((r) => r.data),

  getById: (id) =>
    client.get(`/api/cases/${id}`).then((r) => r.data),

  updateStatus: (id, status) =>
    client.patch(`/api/cases/${id}/status`, { status }).then((r) => r.data),

  resolve: (id) =>
    client.post(`/api/cases/${id}/resolve`).then((r) => r.data),

  getTestimonies: (id) =>
    client.get(`/api/cases/${id}/testimonies`).then((r) => r.data),
};
```

- [ ] **Step 8: Create `dashboard/src/api/admin.api.js`**

```js
import client from './client';

export const adminAPI = {
  getStats: () =>
    client.get('/api/admin/stats').then((r) => r.data),

  getPendingCases: () =>
    client.get('/api/admin/pending').then((r) => r.data),
};
```

- [ ] **Step 9: Commit**

```bash
cd /Users/georges/missing-persons-app
git add dashboard/src/api/ dashboard/src/store/ dashboard/src/__tests__/store/
git commit -m "feat(dashboard): add API client with JWT refresh + Zustand auth store"
```

---

## Task 3: Login Page (Phone → OTP two-step)

**Files:**
- Create: `dashboard/src/pages/LoginPage.jsx`
- Test: `dashboard/src/__tests__/pages/LoginPage.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `dashboard/src/__tests__/pages/LoginPage.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../api/auth.api', () => ({
  authAPI: {
    register: vi.fn().mockResolvedValue({ message: 'OTP sent' }),
    verifyOtp: vi.fn().mockResolvedValue({
      user: { id: '1', role: 'OFFICER' },
      accessToken: 'acc',
      refreshToken: 'ref',
    }),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('../../store/auth.store', () => ({
  useAuthStore: (selector) =>
    selector({ login: vi.fn(), isAuthenticated: false }),
}));

import LoginPage from '../../pages/LoginPage';

describe('LoginPage', () => {
  it('shows phone + name form initially', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByPlaceholderText('+237 6XX XXX XXX')).toBeTruthy();
    expect(screen.getByPlaceholderText('Sgt. Jean Dupont')).toBeTruthy();
  });

  it('moves to OTP step after phone submit', async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Sgt. Jean Dupont'), {
      target: { value: 'Sgt. Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('+237 6XX XXX XXX'), {
      target: { value: '+237600000000' },
    });
    fireEvent.click(screen.getByText('Recevoir le code'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('000000')).toBeTruthy();
    });
  });

  it('shows error when role is not OFFICER or ADMIN', async () => {
    const { authAPI } = await import('../../api/auth.api');
    authAPI.verifyOtp.mockResolvedValueOnce({
      user: { id: '2', role: 'CITIZEN' },
      accessToken: 'x',
      refreshToken: 'y',
    });
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Sgt. Jean Dupont'), { target: { value: 'X' } });
    fireEvent.change(screen.getByPlaceholderText('+237 6XX XXX XXX'), { target: { value: '+237600000001' } });
    fireEvent.click(screen.getByText('Recevoir le code'));
    await waitFor(() => screen.getByPlaceholderText('000000'));
    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Se connecter'));
    await waitFor(() => {
      expect(screen.getByText("Accès réservé aux forces de l'ordre")).toBeTruthy();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/pages/LoginPage.test.jsx
```

Expected: FAIL — `Cannot find module '../../pages/LoginPage'`

- [ ] **Step 3: Create `dashboard/src/pages/LoginPage.jsx`**

```jsx
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
        {/* Header */}
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/pages/LoginPage.test.jsx
```

Expected: PASS — all 3 tests green

- [ ] **Step 5: Commit**

```bash
cd /Users/georges/missing-persons-app
git add dashboard/src/pages/LoginPage.jsx dashboard/src/__tests__/pages/LoginPage.test.jsx
git commit -m "feat(dashboard): add Login page with phone+OTP two-step and role guard"
```

---

## Task 4: App Router + Auth Guard + Sidebar

**Files:**
- Modify: `dashboard/src/App.jsx`
- Create: `dashboard/src/components/Sidebar.jsx`
- Test: `dashboard/src/__tests__/App.test.jsx` (update)

- [ ] **Step 1: Write the failing test**

Replace `dashboard/src/__tests__/App.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('./store/auth.store', () => ({
  useAuthStore: (selector) =>
    selector({
      isAuthenticated: false,
      user: null,
      restoreSession: vi.fn(),
      logout: vi.fn(),
    }),
}));

import App from '../App';

describe('App', () => {
  it('redirects unauthenticated user to login page', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('+237 6XX XXX XXX')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/App.test.jsx
```

Expected: FAIL — stub App renders "SafeTrace Police" text but not the login form

- [ ] **Step 3: Create `dashboard/src/components/Sidebar.jsx`**

```jsx
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
      {/* Logo */}
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

      {/* Nav links */}
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

      {/* Footer */}
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
```

- [ ] **Step 4: Replace `dashboard/src/App.jsx`** with the full router

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import MapPage from './pages/MapPage';
import Sidebar from './components/Sidebar';
import theme from './theme';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function ProtectedLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.colors.background }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  useEffect(() => { restoreSession(); }, [restoreSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

> **Note:** This imports DashboardPage, CasesPage, CaseDetailPage, MapPage which don't exist yet. Create stub files so Vite doesn't error.

- [ ] **Step 5: Create page stubs** (will be replaced in later tasks)

```bash
cd /Users/georges/missing-persons-app/dashboard
mkdir -p src/pages
```

Create `dashboard/src/pages/DashboardPage.jsx`:
```jsx
export default function DashboardPage() { return <div style={{ padding: '2rem', color: '#f1f5f9', fontFamily: 'DM Sans, sans-serif' }}>Dashboard</div>; }
```

Create `dashboard/src/pages/CasesPage.jsx`:
```jsx
export default function CasesPage() { return <div style={{ padding: '2rem', color: '#f1f5f9', fontFamily: 'DM Sans, sans-serif' }}>Dossiers</div>; }
```

Create `dashboard/src/pages/CaseDetailPage.jsx`:
```jsx
export default function CaseDetailPage() { return <div style={{ padding: '2rem', color: '#f1f5f9', fontFamily: 'DM Sans, sans-serif' }}>Détail</div>; }
```

Create `dashboard/src/pages/MapPage.jsx`:
```jsx
export default function MapPage() { return <div style={{ padding: '2rem', color: '#f1f5f9', fontFamily: 'DM Sans, sans-serif' }}>Carte</div>; }
```

- [ ] **Step 6: Run test to verify it passes**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/App.test.jsx
```

Expected: PASS — unauthenticated user sees login form

- [ ] **Step 7: Commit**

```bash
cd /Users/georges/missing-persons-app
git add dashboard/src/App.jsx dashboard/src/components/Sidebar.jsx dashboard/src/pages/ dashboard/src/__tests__/App.test.jsx
git commit -m "feat(dashboard): add app router, auth guard, and sidebar navigation"
```

---

## Task 5: Dashboard Page (Stats)

**Files:**
- Create: `dashboard/src/components/StatCard.jsx`
- Replace: `dashboard/src/pages/DashboardPage.jsx`
- Test: `dashboard/src/__tests__/components/StatCard.test.jsx`
- Test: `dashboard/src/__tests__/pages/DashboardPage.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `dashboard/src/__tests__/components/StatCard.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../../components/StatCard';

describe('StatCard', () => {
  it('renders label and numeric value', () => {
    render(<StatCard label="Cas actifs" value={42} color="#ef4444" />);
    expect(screen.getByText('Cas actifs')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('renders string value (percentage)', () => {
    render(<StatCard label="Taux de résolution" value="80%" color="#a78bfa" />);
    expect(screen.getByText('80%')).toBeTruthy();
  });
});
```

Create `dashboard/src/__tests__/pages/DashboardPage.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../api/admin.api', () => ({
  adminAPI: {
    getStats: vi.fn().mockResolvedValue({
      active: 12, pending: 5, resolved: 48, resolutionRate: 80,
    }),
  },
}));

import DashboardPage from '../../pages/DashboardPage';

describe('DashboardPage', () => {
  it('renders four stat cards with API data', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <DashboardPage />
      </QueryClientProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('12')).toBeTruthy();
      expect(screen.getByText('5')).toBeTruthy();
      expect(screen.getByText('80%')).toBeTruthy();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/components/StatCard.test.jsx src/__tests__/pages/DashboardPage.test.jsx
```

Expected: FAIL — `Cannot find module '../../components/StatCard'`

- [ ] **Step 3: Create `dashboard/src/components/StatCard.jsx`**

```jsx
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
```

- [ ] **Step 4: Replace `dashboard/src/pages/DashboardPage.jsx`**

```jsx
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
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/components/StatCard.test.jsx src/__tests__/pages/DashboardPage.test.jsx
```

Expected: PASS — all 3 tests green

- [ ] **Step 6: Commit**

```bash
cd /Users/georges/missing-persons-app
git add dashboard/src/components/StatCard.jsx dashboard/src/pages/DashboardPage.jsx dashboard/src/__tests__/
git commit -m "feat(dashboard): add Stats dashboard with 4 StatCards from /api/admin/stats"
```

---

## Task 6: Cases Page (Tabbed Table + Validate action)

**Files:**
- Create: `dashboard/src/components/Badge.jsx`
- Replace: `dashboard/src/pages/CasesPage.jsx`
- Test: `dashboard/src/__tests__/components/Badge.test.jsx`
- Test: `dashboard/src/__tests__/pages/CasesPage.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `dashboard/src/__tests__/components/Badge.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../../components/Badge';

describe('Badge', () => {
  it('shows "En attente" for PENDING', () => {
    render(<Badge status="PENDING" />);
    expect(screen.getByText('En attente')).toBeTruthy();
  });
  it('shows "Actif" for ACTIVE', () => {
    render(<Badge status="ACTIVE" />);
    expect(screen.getByText('Actif')).toBeTruthy();
  });
  it('shows "Enquête" for INQUIRY', () => {
    render(<Badge status="INQUIRY" />);
    expect(screen.getByText('Enquête')).toBeTruthy();
  });
  it('shows "Résolu" for RESOLVED', () => {
    render(<Badge status="RESOLVED" />);
    expect(screen.getByText('Résolu')).toBeTruthy();
  });
});
```

Create `dashboard/src/__tests__/pages/CasesPage.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../api/cases.api', () => ({
  casesAPI: {
    list: vi.fn().mockResolvedValue({ cases: [] }),
    updateStatus: vi.fn().mockResolvedValue({}),
  },
}));

import CasesPage from '../../pages/CasesPage';

const renderPage = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CasesPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CasesPage', () => {
  it('renders three tabs', () => {
    renderPage();
    expect(screen.getByText('À valider')).toBeTruthy();
    expect(screen.getByText('En cours')).toBeTruthy();
    expect(screen.getByText('Archivés')).toBeTruthy();
  });

  it('switches active tab on click without crashing', () => {
    renderPage();
    fireEvent.click(screen.getByText('En cours'));
    expect(screen.getByText('En cours')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/components/Badge.test.jsx src/__tests__/pages/CasesPage.test.jsx
```

Expected: FAIL — modules not found

- [ ] **Step 3: Create `dashboard/src/components/Badge.jsx`**

```jsx
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
```

- [ ] **Step 4: Replace `dashboard/src/pages/CasesPage.jsx`**

```jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { casesAPI } from '../api/cases.api';
import Badge from '../components/Badge';
import theme from '../theme';

const TABS = [
  { label: 'À valider', status: 'PENDING' },
  { label: 'En cours',  status: 'ACTIVE,INQUIRY' },
  { label: 'Archivés',  status: 'RESOLVED' },
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

      {/* Tabs */}
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
                      {c.status === 'PENDING' && (
                        <button
                          onClick={() => validateMutation.mutate({ id: c.id, status: 'ACTIVE' })}
                          style={{
                            background: `${theme.colors.success}20`,
                            color: theme.colors.success,
                            border: 'none',
                            borderRadius: 6,
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif',
                          }}
                        >
                          Valider
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
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/components/Badge.test.jsx src/__tests__/pages/CasesPage.test.jsx
```

Expected: PASS — all 6 tests green

- [ ] **Step 6: Commit**

```bash
cd /Users/georges/missing-persons-app
git add dashboard/src/components/Badge.jsx dashboard/src/pages/CasesPage.jsx dashboard/src/__tests__/
git commit -m "feat(dashboard): add Cases page with tabs (À valider/En cours/Archivés) and validate action"
```

---

## Task 7: PDF Export Utility

**Files:**
- Create: `dashboard/src/utils/pdf.js`
- Test: `dashboard/src/__tests__/utils/pdf.test.js`

- [ ] **Step 1: Write the failing test**

Create `dashboard/src/__tests__/utils/pdf.test.js`:

```js
import { describe, it, expect, vi } from 'vitest';

const mockSave = vi.fn();
const mockInstance = {
  internal: { pageSize: { getWidth: () => 210 } },
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  text: vi.fn(),
  splitTextToSize: (text) => [text],
  addPage: vi.fn(),
  save: mockSave,
};

vi.mock('jspdf', () => ({ default: vi.fn(() => mockInstance) }));

import { generateCasePDF } from '../../utils/pdf';

const sampleCase = {
  id: 'case-42',
  person_name: 'Jean Dupont',
  person_age: 25,
  person_gender: 'M',
  last_seen_location: 'Yaoundé Centre',
  status: 'ACTIVE',
  description: 'Port de chemise bleue',
  created_at: new Date('2026-05-01').toISOString(),
};

describe('generateCasePDF', () => {
  it('saves PDF with case id in filename', () => {
    generateCasePDF(sampleCase, []);
    expect(mockSave).toHaveBeenCalledWith('safetrace-dossier-case-42.pdf');
  });

  it('includes testimony content when testimonies provided', () => {
    generateCasePDF(sampleCase, [{ content: 'Vu près du marché', created_at: new Date().toISOString() }]);
    expect(mockInstance.text).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining('Vu près du marché')]),
      expect.any(Number),
      expect.any(Number)
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/utils/pdf.test.js
```

Expected: FAIL — `Cannot find module '../../utils/pdf'`

- [ ] **Step 3: Create `dashboard/src/utils/pdf.js`**

```js
import jsPDF from 'jspdf';

export function generateCasePDF(caseData, testimonies) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeTrace — Rapport de dossier', 20, 20);

  doc.setFontSize(13);
  doc.text(`Dossier #${caseData.id}`, 20, 32);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const fields = [
    ['Nom',               caseData.person_name],
    ['Âge',              `${caseData.person_age} ans`],
    ['Sexe',              caseData.person_gender === 'M' ? 'Masculin' : 'Féminin'],
    ['Dernier lieu vu',   caseData.last_seen_location],
    ['Statut',            caseData.status],
    ['Description',       caseData.description],
    ['Signalé le',        new Date(caseData.created_at).toLocaleString('fr-FR')],
  ];

  let y = 46;
  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label} :`, 20, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(value ?? ''), pageWidth - 80);
    doc.text(lines, 70, y);
    y += 8 * lines.length + 2;
  });

  if (testimonies.length > 0) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Témoignages :', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    testimonies.forEach((t, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${t.content}`, pageWidth - 40);
      if (y + 8 * lines.length > 270) { doc.addPage(); y = 20; }
      doc.text(lines, 20, y);
      y += 8 * lines.length + 4;
    });
  }

  doc.save(`safetrace-dossier-${caseData.id}.pdf`);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/utils/pdf.test.js
```

Expected: PASS — both tests green

- [ ] **Step 5: Commit**

```bash
cd /Users/georges/missing-persons-app
git add dashboard/src/utils/pdf.js dashboard/src/__tests__/utils/pdf.test.js
git commit -m "feat(dashboard): add PDF export utility for case reports"
```

---

## Task 8: Case Detail Page

**Files:**
- Replace: `dashboard/src/pages/CaseDetailPage.jsx`

> No separate test file — the page orchestrates already-tested modules (casesAPI, generateCasePDF, Badge). The integration is verified manually in the dev server.

- [ ] **Step 1: Replace `dashboard/src/pages/CaseDetailPage.jsx`**

```jsx
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
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          color: theme.colors.text, fontSize: '1.75rem', margin: 0,
        }}>
          {c.person_name}
        </h2>
        <Badge status={c.status} />
      </div>

      {/* Photo + Info */}
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

      {/* Action buttons */}
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

      {/* Testimonies */}
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
```

- [ ] **Step 2: Verify all existing tests still pass**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run
```

Expected: PASS — all previous tests still green (no regressions)

- [ ] **Step 3: Commit**

```bash
cd /Users/georges/missing-persons-app
git add dashboard/src/pages/CaseDetailPage.jsx
git commit -m "feat(dashboard): add Case Detail page with actions (validate/urgent/resolve) and PDF export"
```

---

## Task 9: Map Page (Leaflet + OpenStreetMap)

**Files:**
- Replace: `dashboard/src/pages/MapPage.jsx`
- Test: `dashboard/src/__tests__/pages/MapPage.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `dashboard/src/__tests__/pages/MapPage.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
}));

vi.mock('leaflet', () => ({
  default: {
    Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
    divIcon: vi.fn(() => ({})),
  },
}));

vi.mock('../../api/cases.api', () => ({
  casesAPI: {
    list: vi.fn().mockResolvedValue({
      cases: [
        { id: '1', person_name: 'Alice', status: 'ACTIVE', latitude: 3.848, longitude: 11.502, last_seen_location: 'Yaoundé' },
        { id: '2', person_name: 'Bob',   status: 'RESOLVED', latitude: 4.0, longitude: 9.7, last_seen_location: 'Douala' },
      ],
    }),
  },
}));

import MapPage from '../../pages/MapPage';

describe('MapPage', () => {
  const renderPage = () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
      <QueryClientProvider client={qc}>
        <MapPage />
      </QueryClientProvider>
    );
  };

  it('renders map container', () => {
    renderPage();
    expect(screen.getByTestId('map-container')).toBeTruthy();
  });

  it('renders status filter select', () => {
    renderPage();
    expect(screen.getByDisplayValue('Tous')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/pages/MapPage.test.jsx
```

Expected: FAIL — `Cannot find module '../../pages/MapPage'` (stub has no map)

- [ ] **Step 3: Replace `dashboard/src/pages/MapPage.jsx`**

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { casesAPI } from '../api/cases.api';
import theme from '../theme';

// Fix Leaflet icon resolution broken by Vite's bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLOR = {
  ACTIVE:   '#ef4444',
  PENDING:  '#f97316',
  INQUIRY:  '#f97316',
  RESOLVED: '#22c55e',
};

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px ${color}80"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function MapPage() {
  const [filter, setFilter] = useState('ALL');

  const { data } = useQuery({
    queryKey: ['cases', 'map'],
    queryFn: () => casesAPI.list({ limit: 500, offset: 0 }),
  });

  const cases = (data?.cases ?? []).filter(
    (c) => filter === 'ALL' || c.status === filter
  );

  return (
    <div style={{ padding: '2rem', height: '100%' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          color: theme.colors.text, fontSize: '1.75rem', margin: 0,
        }}>
          Carte des dossiers
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            borderRadius: theme.radius.md,
            padding: '0.5rem 1rem',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.875rem',
          }}
        >
          <option value="ALL">Tous</option>
          <option value="ACTIVE">Actifs</option>
          <option value="INQUIRY">Enquête</option>
          <option value="PENDING">En attente</option>
          <option value="RESOLVED">Résolus</option>
        </select>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
        {Object.entries({ 'Actif / Urgent': '#ef4444', 'En attente': '#f97316', 'Résolu': '#22c55e' }).map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: theme.colors.textMuted }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ height: 'calc(100vh - 220px)', borderRadius: theme.radius.lg, overflow: 'hidden' }}>
        <MapContainer
          center={[3.848, 11.502]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          {cases.map((c) =>
            c.latitude && c.longitude ? (
              <Marker
                key={c.id}
                position={[c.latitude, c.longitude]}
                icon={makeIcon(STATUS_COLOR[c.status] ?? '#f97316')}
              >
                <Popup>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: 160 }}>
                    <strong>{c.person_name}</strong><br />
                    <span style={{ color: STATUS_COLOR[c.status] }}>{c.status}</span><br />
                    {c.last_seen_location}
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run src/__tests__/pages/MapPage.test.jsx
```

Expected: PASS — both tests green

- [ ] **Step 5: Commit**

```bash
cd /Users/georges/missing-persons-app
git add dashboard/src/pages/MapPage.jsx dashboard/src/__tests__/pages/MapPage.test.jsx
git commit -m "feat(dashboard): add Leaflet map with OpenStreetMap tiles and status-colored markers"
```

---

## Task 10: Final Config + Full Test Suite

**Files:**
- Verify: `dashboard/index.html` (already done in Task 1)
- Verify: `dashboard/vite.config.js` (proxy already set in Task 1)

- [ ] **Step 1: Run the full test suite**

```bash
cd /Users/georges/missing-persons-app/dashboard
npx vitest run
```

Expected output — all passing:
```
 ✓ src/__tests__/App.test.jsx
 ✓ src/__tests__/store/auth.store.test.js
 ✓ src/__tests__/components/StatCard.test.jsx
 ✓ src/__tests__/components/Badge.test.jsx
 ✓ src/__tests__/pages/LoginPage.test.jsx
 ✓ src/__tests__/pages/DashboardPage.test.jsx
 ✓ src/__tests__/pages/CasesPage.test.jsx
 ✓ src/__tests__/pages/MapPage.test.jsx
 ✓ src/__tests__/utils/pdf.test.js

 Test Files  9 passed (9)
 Tests      20 passed (20)
```

If any test fails, fix before continuing.

- [ ] **Step 2: Start the dev server and smoke-test the UI**

```bash
cd /Users/georges/missing-persons-app/dashboard
npm run dev
```

Open `http://localhost:5173` in your browser. Verify:
- [ ] Unauthenticated → redirected to `/login`
- [ ] Login page shows SafeTrace Police logo, police purple button
- [ ] Google Fonts (Syne headings, DM Sans body) load correctly
- [ ] After authentication with a real OFFICER account → sidebar appears
- [ ] `/` shows 4 StatCards (may show 0 if backend not running — that's fine)
- [ ] `/cases` shows 3 tabs; empty state message displays
- [ ] `/map` shows OpenStreetMap centered on Cameroon
- [ ] `/cases/:id` for a valid id shows case info + action buttons

- [ ] **Step 3: Verify the `/api` proxy works** (requires backend running)

```bash
# In a separate terminal, start the backend:
cd /Users/georges/missing-persons-app/backend
node src/app.js

# Then in dashboard:
# Open http://localhost:5173/login and complete OTP flow
# Verify that network requests go to localhost:3000 via proxy
```

- [ ] **Step 4: Build for production to check for type errors / missing imports**

```bash
cd /Users/georges/missing-persons-app/dashboard
npm run build
```

Expected: build completes with no errors. Output in `dashboard/dist/`.

- [ ] **Step 5: Final commit**

```bash
cd /Users/georges/missing-persons-app
git add dashboard/
git commit -m "feat(dashboard): complete police web dashboard — all tests pass, build clean"
```

- [ ] **Step 6: Push to GitHub**

```bash
git push origin main
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Covered in |
|---|---|
| Stats : cas actifs / en attente / résolus / taux résolution | Task 5 — DashboardPage + StatCard |
| File de validation : valider, marquer urgent, demander révision | Task 8 — CaseDetailPage action buttons |
| Onglets : À valider / En cours / Archivés | Task 6 — CasesPage tabs |
| Accès restreint : OTP + rôle OFFICER/ADMIN | Task 3 — LoginPage role check |
| Accès restreint : whitelist IP | Server-side concern (API backend plan), not client-side |
| Export dossiers en PDF | Task 7 — pdf.js + Task 8 — CaseDetailPage "Exporter PDF" button |
| Carte OpenStreetMap — épingles colorées par statut | Task 9 — MapPage markers |
| Callout card au clic sur épingle | Task 9 — Leaflet Popup |
| Filtre par zone géographique | Task 9 — status filter select |
| Design : Syne + DM Sans, #080c14, #f97316, #a78bfa | Tasks 1+4 — theme.js, index.html |
| Lucide Icons | Task 4 — Sidebar inline SVG icons |
| JWT access/refresh token management | Task 2 — client.js interceptor |
| PATCH /api/cases/:id/status (OFFICER only) | Tasks 6+8 — updateStatus call |
| POST /api/cases/:id/resolve | Task 8 — resolveMutation |
| GET /api/cases/:id/testimonies | Task 8 — testimony query |
| GET /api/admin/stats | Task 5 — adminAPI.getStats |

### Placeholder scan — none found

All steps contain complete code, exact commands, and expected output. No "TBD", no "add validation", no "similar to task N".

### Type consistency check

- `casesAPI.list(params)` used identically in CasesPage (Task 6) and MapPage (Task 9) ✓
- `casesAPI.updateStatus(id, status)` called in CasesPage (`{ id, status }` destructure → `casesAPI.updateStatus(id, status)`) and CaseDetailPage (`statusMutation.mutate(status)` → `casesAPI.updateStatus(id, status)`) ✓
- `adminAPI.getStats()` returns `{ active, pending, resolved, resolutionRate }` — StatCard reads `stats?.active` etc. ✓
- `generateCasePDF(caseData, testimonies)` — same signature in pdf.js definition and CaseDetailPage call ✓
- `Badge` receives `status` prop (string) — same in CasesPage and CaseDetailPage ✓
- `StatCard` receives `{ label, value, color }` — matches all 4 usages in DashboardPage ✓
