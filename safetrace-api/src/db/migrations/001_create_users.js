exports.up = (knex) =>
  knex.schema.raw('CREATE EXTENSION IF NOT EXISTS postgis').then(() =>
    knex.schema.createTable('users', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.string('phone', 20).notNullable().unique();
      t.string('name', 100);
      t.enu('role', ['CITIZEN', 'FAMILY', 'OFFICER', 'ADMIN']).defaultTo('CITIZEN');
      t.string('region', 100);
      t.string('push_token');
      t.boolean('is_verified').defaultTo(false);
      t.timestamp('verified_at');
      t.timestamps(true, true);
    })
  );

exports.down = (knex) => knex.schema.dropTable('users');
