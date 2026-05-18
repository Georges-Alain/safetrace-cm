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
