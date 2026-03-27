import { readdir } from 'fs/promises';
import { resolve } from 'path';
import dataSource from '../data-source';
import { SchemaMigration } from '../entities/schema-migration.entity';
import { MongoMigration } from '../migrations/migration.interface';

async function loadMigrationFiles() {
  const directory = resolve(process.cwd(), 'src/database/migrations');
  const files = await readdir(directory).catch(() => []);

  return files
    .filter((file) => file.endsWith('.ts') && file !== 'migration.interface.ts')
    .sort();
}

async function main() {
  await dataSource.initialize();

  try {
    await dataSource.synchronize();

    const executedRepo = dataSource.getMongoRepository(SchemaMigration);
    const executed = await executedRepo.find();
    const executedNames = new Set(executed.map((migration) => migration.name));
    const files = await loadMigrationFiles();

    for (const file of files) {
      const modulePath = resolve(process.cwd(), 'src/database/migrations', file);
      const importedModule = require(modulePath) as {
        default?: MongoMigration;
      };
      const migration = importedModule.default;

      if (!migration || !migration.name) {
        throw new Error(`Invalid migration export in ${file}`);
      }

      if (executedNames.has(migration.name)) {
        continue;
      }

      await migration.up(dataSource);
      await executedRepo.save(
        executedRepo.create({
          name: migration.name,
          executedAt: new Date(),
        }),
      );
      console.log(`Applied migration: ${migration.name}`);
    }

    console.log('MongoDB schema sync and migrations completed successfully.');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
