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
