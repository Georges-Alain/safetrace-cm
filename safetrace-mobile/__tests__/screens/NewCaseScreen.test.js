import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NewCaseScreen from '../../src/screens/cases/NewCaseScreen';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 3.848, longitude: 11.502 }
  })),
  Accuracy: { Balanced: 3 },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true })),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('../../src/api/cases.api', () => ({
  casesAPI: {
    create: jest.fn(() => Promise.resolve({ id: 'new-case-id', status: 'PENDING' })),
  },
}));

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock')
);

jest.mock('../../src/db/database', () => ({
  pendingCasesCollection: {
    add: jest.fn(() => Promise.resolve()),
    getPending: jest.fn(() => Promise.resolve([])),
    markSynced: jest.fn(() => Promise.resolve()),
  },
}));

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

test('affiche le formulaire avec le bouton de soumission', () => {
  const { getByText } = render(<NewCaseScreen navigation={mockNavigation} />);
  expect(getByText('Envoyer le signalement')).toBeTruthy();
});

test('valide les champs requis avant soumission', async () => {
  const { getByText, findByText } = render(<NewCaseScreen navigation={mockNavigation} />);
  fireEvent.press(getByText('Envoyer le signalement'));
  const errorMsg = await findByText(/nom requis/i);
  expect(errorMsg).toBeTruthy();
});
