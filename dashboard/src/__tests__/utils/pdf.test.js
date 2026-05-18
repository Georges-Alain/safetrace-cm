import { describe, it, expect, vi } from 'vitest';

const mockSave = vi.fn();
const mockInstance = {
  internal: { pageSize: { getWidth: () => 210 } },
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  text: vi.fn(),
  splitTextToSize: (text) => [text],
  addPage: vi.fn(),
  save: mockSave,
};

vi.mock('jspdf', () => ({ default: vi.fn(() => mockInstance) }));

import { generateCasePDF } from '../../utils/pdf';

const sampleCase = {
  id: 'case-42',
  person_name: 'Jean Dupont',
  person_age: 25,
  person_gender: 'M',
  last_seen_location: 'Yaoundé Centre',
  status: 'ACTIVE',
  description: 'Port de chemise bleue',
  created_at: new Date('2026-05-01').toISOString(),
};

describe('generateCasePDF', () => {
  it('saves PDF with case id in filename', () => {
    generateCasePDF(sampleCase, []);
    expect(mockSave).toHaveBeenCalledWith('safetrace-dossier-case-42.pdf');
  });

  it('includes testimony content when testimonies provided', () => {
    generateCasePDF(sampleCase, [{ content: 'Vu près du marché', created_at: new Date().toISOString() }]);
    expect(mockInstance.text).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining('Vu près du marché')]),
      expect.any(Number),
      expect.any(Number)
    );
  });
});
