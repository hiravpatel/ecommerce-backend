import { readdir } from 'fs/promises';
import { resolve } from 'path';
import dataSource from '../data-source';
import { SchemaMigration } from '../entities/schema-migration.entity';
import { MongoMigration } from '../migrations/migration.interface';

async function loadMigrations() {
  const directory = resolve(process.cwd(), 'src/database/migrations');
  const files = await readdir(directory).catch(() => []);
  const migrations = new Map<string, MongoMigration>();

  for (const file of files.filter(
    (entry) => entry.endsWith('.ts') && entry !== 'migration.interface.ts',
  )) {
    const modulePath = resolve(directory, file);
    const importedModule = require(modulePath) as {
      default?: MongoMigration;
    };

    if (importedModule.default?.name) {
      migrations.set(importedModule.default.name, importedModule.default);
    }
  }

  return migrations;
}

async function main() {
  await dataSource.initialize();

  try {
    const executedRepo = dataSource.getMongoRepository(SchemaMigration);
    const executed = await executedRepo.find();

    if (executed.length === 0) {
      console.log('No executed migrations found.');
      return;
    }

    const latest = executed.sort(
      (left, right) => right.executedAt.getTime() - left.executedAt.getTime(),
    )[0];
    const migrations = await loadMigrations();
    const migration = migrations.get(latest.name);

    if (!migration) {
      throw new Error(`Could not find migration file for ${latest.name}`);
    }

    await migration.down(dataSource);
    await executedRepo.delete(latest._id);
    console.log(`Reverted migration: ${latest.name}`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
