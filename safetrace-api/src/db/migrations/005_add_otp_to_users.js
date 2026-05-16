exports.up = (knex) =>
  knex.schema.table('users', (t) => {
    t.string('otp_code', 6);
    t.timestamp('otp_expires_at');
    t.string('refresh_token');
  });

exports.down = (knex) =>
  knex.schema.table('users', (t) => {
    t.dropColumns('otp_code', 'otp_expires_at', 'refresh_token');
  });
