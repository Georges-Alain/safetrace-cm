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
