import { initDatabase } from '../backend/src/db/schema';

console.log('Running database migration...');
initDatabase();
console.log('Migration complete.');
process.exit(0);
