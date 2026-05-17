const db = require('../../config/db');

async function getStats() {
  const counts = await db('cases')
    .select('status')
    .count('* as count')
    .groupBy('status');

  const result = { active: 0, pending: 0, inquiry: 0, resolved: 0, total: 0 };
  counts.forEach(({ status, count }) => {
    const key = status.toLowerCase();
    result[key] = Number(count);
    result.total += Number(count);
  });

  result.resolutionRate = result.total > 0
    ? Math.round((result.resolved / result.total) * 100)
    : 0;

  return result;
}

async function getPendingCases() {
  return db('cases')
    .where({ status: 'PENDING' })
    .orderBy('created_at', 'asc')
    .limit(50);
}

module.exports = { getStats, getPendingCases };
