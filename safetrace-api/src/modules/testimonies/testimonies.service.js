const db = require('../../config/db');

async function create({ case_id, content, photo_url, latitude, longitude }, authorId) {
  const cas = await db('cases').where({ id: case_id }).select('status').first();
  if (!cas) throw { status: 404, message: 'Dossier introuvable' };
  if (!['ACTIVE', 'INQUIRY'].includes(cas.status)) {
    throw { status: 403, message: 'Les témoignages ne sont acceptés que pour les dossiers en cours' };
  }

  const [t] = await db('testimonies')
    .insert({
      case_id,
      author_id: authorId,
      content,
      photo_url,
      location: latitude && longitude
        ? db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [longitude, latitude])
        : null,
    })
    .returning('*');
  return t;
}

async function listByCaseId(caseId) {
  return db('testimonies').where({ case_id: caseId }).orderBy('created_at', 'desc');
}

module.exports = { create, listByCaseId };
