jest.mock('../../config/sms', () => ({
  send: jest.fn().mockResolvedValue({ SMSMessageData: { Recipients: [{ status: 'Success' }] } })
}));
jest.mock('../../config/firebase', () => ({
  sendMulticast: jest.fn().mockResolvedValue({ successCount: 2, failureCount: 0 })
}));

const db = require('../../config/db');
const alertsService = require('./alerts.service');

beforeAll(() => db.migrate.latest());
afterAll(() => db.destroy());

test('sendAlerts — envoie push et SMS aux utilisateurs dans le rayon', async () => {
  const mockCase = {
    id: 'case-001',
    person_name: 'Kofi Mballa',
    person_age: 14,
    last_seen_location: 'Yaoundé Centre',
    latitude: 3.848,
    longitude: 11.502
  };
  const result = await alertsService.sendAlerts(mockCase);
  expect(result).toHaveProperty('push');
  expect(result).toHaveProperty('sms');
});
