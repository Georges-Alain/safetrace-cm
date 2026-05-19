const db = require('../../config/db');

async function toggleReaction(caseId, userId) {
  const caseExists = await db('cases').where({ id: caseId }).select('id').first();
  if (!caseExists) throw { status: 404, message: 'Dossier introuvable' };

  const existing = await db('reactions')
    .where({ case_id: caseId, user_id: userId, type: 'HUG' })
    .first();

  if (existing) {
    await db('reactions').where({ id: existing.id }).delete();
  } else {
    await db('reactions').insert({ case_id: caseId, user_id: userId, type: 'HUG' });
  }

  const { count } = await db('reactions')
    .where({ case_id: caseId, type: 'HUG' })
    .count('* as count')
    .first();

  return { reacted: !existing, count: Number(count) };
}

module.exports = { toggleReaction };
