import { initDatabase } from '../backend/src/db/schema';
import { runDailyPipeline } from '../backend/src/pipeline/daily';

async function main() {
  console.log('Initializing database...');
  initDatabase();

  console.log('Running daily pipeline manually...');
  await runDailyPipeline();

  console.log('Seed complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
