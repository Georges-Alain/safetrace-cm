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
