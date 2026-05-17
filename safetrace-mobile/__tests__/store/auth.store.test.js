import { useAuthStore } from '../../src/store/auth.store';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(() => null),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../../src/api/auth.api', () => ({
  authAPI: {
    verifyOTP: jest.fn(() => Promise.resolve({
      accessToken: 'tok_abc',
      refreshToken: 'ref_xyz',
      user: { id: '1', name: 'Test', role: 'CITIZEN' }
    }))
  }
}));

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null });
});

test('login — stocke les tokens et l\'utilisateur', async () => {
  const { login } = useAuthStore.getState();
  await login('+237612345678', '123456');
  const state = useAuthStore.getState();
  expect(state.accessToken).toBe('tok_abc');
  expect(state.user.name).toBe('Test');
});

test('logout — vide le state', async () => {
  useAuthStore.setState({ accessToken: 'tok_abc', user: { name: 'Test' } });
  const { logout } = useAuthStore.getState();
  await logout();
  const state = useAuthStore.getState();
  expect(state.accessToken).toBeNull();
  expect(state.user).toBeNull();
});

test('restoreSession — recharge le token depuis SecureStore', async () => {
  const SecureStore = require('expo-secure-store');
  SecureStore.getItemAsync.mockResolvedValueOnce('tok_restored');
  const { restoreSession } = useAuthStore.getState();
  await restoreSession();
  const state = useAuthStore.getState();
  expect(state.accessToken).toBe('tok_restored');
});
