exports.up = (knex) =>
  knex.schema.createTable('alerts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('case_id').notNullable().references('id').inTable('cases').onDelete('CASCADE');
    t.enu('channel', ['PUSH', 'SMS']).notNullable();
    t.integer('recipients_count').defaultTo(0);
    t.timestamp('sent_at').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable('alerts');
