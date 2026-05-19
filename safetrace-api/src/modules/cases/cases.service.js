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

async function listCases({ page = 1, limit = 20, status, lat, lng, radiusKm = 50 }) {
  let query = db('cases').select('*').orderBy('created_at', 'desc');

  if (status) query = query.where({ status });

  if (lat && lng) {
    query = query.whereRaw(
      `ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)`,
      [lng, lat, radiusKm * 1000]
    );
  }

  const total = await query.clone().clearSelect().clearOrder().count('* as count').first();
  const data = await query.offset((page - 1) * limit).limit(limit);

  return { data, total: Number(total.count), page, limit };
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
