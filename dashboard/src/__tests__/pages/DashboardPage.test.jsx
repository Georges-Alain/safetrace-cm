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
