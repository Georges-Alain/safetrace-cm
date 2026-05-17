const db = require('../../config/db');

async function create({ case_id, content, photo_url, latitude, longitude }, authorId) {
  const [t] = await db('testimonies')
    .insert({
      case_id,
      author_id: authorId,
      content,
      photo_url,
      location: latitude && longitude
        ? db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [longitude, latitude])
        : null
    })
    .returning('*');
  return t;
}

async function listByCaseId(caseId) {
  return db('testimonies').where({ case_id: caseId }).orderBy('created_at', 'desc');
}

module.exports = { create, listByCaseId };
