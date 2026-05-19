import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '../../pages/DashboardPage';

vi.mock('../../api/admin.api', () => ({
  adminAPI: {
    getStats: vi.fn().mockResolvedValue({
      active: 12, pending: 5, resolved: 48, resolutionRate: 80,
      reactions_total: 230, testimonies_week: 14,
    }),
  },
}));

describe('DashboardPage', () => {
  it('renders six stat cards with API data', async () => {
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
      expect(screen.getByText('230')).toBeTruthy();
      expect(screen.getByText('14')).toBeTruthy();
    });
  });
});
