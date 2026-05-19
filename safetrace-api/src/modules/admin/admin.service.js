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

  const [reactionsResult, testimoniesTodayResult] = await Promise.all([
    db('reactions').count('* as count').first(),
    db('testimonies')
      .where('created_at', '>=', db.raw("NOW() - INTERVAL '7 days'"))
      .count('* as count')
      .first(),
  ]);

  result.reactions_total = Number(reactionsResult.count);
  result.testimonies_week = Number(testimoniesTodayResult.count);

  return result;
}

async function getPendingCases() {
  return db('cases')
    .where({ status: 'PENDING' })
    .orderBy('created_at', 'asc')
    .limit(50);
}

module.exports = { getStats, getPendingCases };
