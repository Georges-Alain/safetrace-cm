import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../../components/StatCard';

describe('StatCard', () => {
  it('renders label and numeric value', () => {
    render(<StatCard label="Cas actifs" value={42} color="#ef4444" />);
    expect(screen.getByText('Cas actifs')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('renders string value (percentage)', () => {
    render(<StatCard label="Taux de résolution" value="80%" color="#a78bfa" />);
    expect(screen.getByText('80%')).toBeTruthy();
  });
});
