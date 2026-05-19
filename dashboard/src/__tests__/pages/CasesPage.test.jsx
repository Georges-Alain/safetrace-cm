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
  it('renders three tabs with new labels', () => {
    renderPage();
    expect(screen.getByText('Actifs')).toBeTruthy();
    expect(screen.getByText('Urgents')).toBeTruthy();
    expect(screen.getByText('Résolus')).toBeTruthy();
  });

  it('switches active tab on click without crashing', () => {
    renderPage();
    fireEvent.click(screen.getByText('Urgents'));
    expect(screen.getByText('Urgents')).toBeTruthy();
  });
});
