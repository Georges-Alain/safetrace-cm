import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'pending_cases',
      columns: [
        { name: 'person_name', type: 'string' },
        { name: 'person_age', type: 'number', isOptional: true },
        { name: 'person_gender', type: 'string', isOptional: true },
        { name: 'last_seen_location', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'photo_uri', type: 'string', isOptional: true },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'last_seen_at', type: 'string' },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at_local', type: 'number' },
      ],
    }),
  ],
});
