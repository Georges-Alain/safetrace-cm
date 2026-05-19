const db = require('../../config/db');

async function createCase(data, reporterId) {
  const { latitude, longitude, ...rest } = data;

  const [newCase] = await db('cases')
    .insert({
      ...rest,
      reporter_id: reporterId,
      status: 'ACTIVE',
      location: db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [longitude, latitude])
    })
    .returning('*');

  return newCase;
}

async function listCases({ page = 1, limit = 20, status, lat, lng, radiusKm = 50, userId }) {
  const offset = (Number(page) - 1) * Number(limit);

  let baseQuery = db('cases as c').orderBy('c.created_at', 'desc');

  if (status) {
    const statuses = status.split(',').map((s) => s.trim());
    baseQuery = baseQuery.whereIn('c.status', statuses);
  }

  if (lat && lng) {
    baseQuery = baseQuery.whereRaw(
      `ST_DWithin(c.location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)`,
      [lng, lat, radiusKm * 1000]
    );
  }

  const totalResult = await baseQuery.clone().clearOrder().count('c.id as count').first();

  const data = await baseQuery
    .clone()
    .select([
      'c.*',
      db.raw(
        `COALESCE((SELECT COUNT(*) FROM reactions r WHERE r.case_id = c.id AND r.type = 'HUG'), 0)::int AS reactions_count`
      ),
      db.raw(
        `COALESCE((SELECT COUNT(*) FROM testimonies t WHERE t.case_id = c.id), 0)::int AS testimonies_count`
      ),
      userId
        ? db.raw(
            `EXISTS(SELECT 1 FROM reactions r2 WHERE r2.case_id = c.id AND r2.user_id = ? AND r2.type = 'HUG') AS user_reacted`,
            [userId]
          )
        : db.raw(`false AS user_reacted`),
    ])
    .offset(offset)
    .limit(Number(limit));

  return { data, total: Number(totalResult.count), page: Number(page), limit: Number(limit) };
}

async function getCaseById(id) {
  const c = await db('cases').where({ id }).first();
  if (!c) throw { status: 404, message: 'Dossier introuvable' };
  return c;
}

async function updateStatus(id, status, officerId) {
  const allowed = ['PENDING', 'ACTIVE', 'INQUIRY', 'RESOLVED'];
  if (!allowed.includes(status)) throw { status: 400, message: 'Statut invalide' };

  const [updated] = await db('cases')
    .where({ id })
    .update({ status, validated_by: officerId, updated_at: new Date() })
    .returning('*');

  if (!updated) throw { status: 404, message: 'Dossier introuvable' };
  return updated;
}

async function resolveCase(id, officerId) {
  const [updated] = await db('cases')
    .where({ id })
    .update({ status: 'RESOLVED', validated_by: officerId, resolved_at: new Date() })
    .returning('*');
  if (!updated) throw { status: 404, message: 'Dossier introuvable' };
  return updated;
}

module.exports = { createCase, listCases, getCaseById, updateStatus, resolveCase };
