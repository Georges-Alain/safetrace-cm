exports.up = (knex) =>
  knex.schema.createTable('reactions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('case_id').notNullable().references('id').inTable('cases').onDelete('CASCADE');
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.enu('type', ['HUG']).defaultTo('HUG');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.unique(['case_id', 'user_id', 'type']);
  });

exports.down = (knex) => knex.schema.dropTable('reactions');
