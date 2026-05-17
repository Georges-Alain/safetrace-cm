import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import PendingCase from './models/PendingCase';

const adapter = new SQLiteAdapter({ schema, jsi: true });

export const database = new Database({
  adapter,
  modelClasses: [PendingCase],
});

export const pendingCasesCollection = database.get('pending_cases');
