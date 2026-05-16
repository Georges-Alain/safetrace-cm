exports.up = (knex) =>
  knex.schema.createTable('testimonies', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('case_id').notNullable().references('id').inTable('cases').onDelete('CASCADE');
    t.uuid('author_id').references('id').inTable('users').onDelete('SET NULL');
    t.text('content').notNullable();
    t.string('photo_url');
    t.specificType('location', 'GEOGRAPHY(POINT, 4326)');
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTable('testimonies');
