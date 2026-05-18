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
