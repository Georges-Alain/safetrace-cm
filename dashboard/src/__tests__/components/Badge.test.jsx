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
