const db = require('../../config/db');
const sms = require('../../config/sms');
const messaging = require('../../config/firebase');

async function sendAlerts(caseData) {
  const { id: caseId, person_name, person_age, last_seen_location, latitude, longitude } = caseData;

  const nearbyUsers = await db('users')
    .select('id', 'phone', 'push_token')
    .whereNotNull('push_token')
    .whereRaw(
      `ST_DWithin(
        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
        50000
      )`,
      [longitude, latitude, longitude, latitude]
    );

  const pushTokens = nearbyUsers.map((u) => u.push_token).filter(Boolean);
  const phones = nearbyUsers.map((u) => u.phone);

  let pushResult = { successCount: 0 };
  let smsResult = { count: 0 };

  if (pushTokens.length > 0) {
    pushResult = await messaging.sendMulticast({
      tokens: pushTokens,
      notification: {
        title: `⚠ SAFETRACE ALERTE`,
        body: `${person_name}, ${person_age} ans, disparu(e) à ${last_seen_location}`
      },
      data: { caseId, type: 'MISSING_PERSON_ALERT' }
    });
    await db('alerts').insert({ case_id: caseId, channel: 'PUSH', recipients_count: pushResult.successCount });
  }

  if (phones.length > 0 && process.env.NODE_ENV === 'production') {
    await sms.send({
      to: phones,
      message: `SAFETRACE ALERTE: ${person_name}, ${person_age} ans, disparu(e) a ${last_seen_location}. safetrace.cm/cas/${caseId}`,
      from: process.env.AT_SENDER_ID
    });
    smsResult = { count: phones.length };
    await db('alerts').insert({ case_id: caseId, channel: 'SMS', recipients_count: phones.length });
  }

  return { push: pushResult, sms: smsResult };
}

module.exports = { sendAlerts };
