exports.up = (knex) =>
  knex.schema.createTable('cases', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('reporter_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('person_name', 150).notNullable();
    t.integer('person_age');
    t.enu('person_gender', ['M', 'F', 'OTHER']);
    t.text('description');
    t.string('photo_url');
    t.string('last_seen_location', 255);
    t.timestamp('last_seen_at');
    t.specificType('location', 'GEOGRAPHY(POINT, 4326)');
    t.enu('status', ['PENDING', 'ACTIVE', 'INQUIRY', 'RESOLVED']).defaultTo('PENDING');
    t.uuid('validated_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('resolved_at');
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTable('cases');
