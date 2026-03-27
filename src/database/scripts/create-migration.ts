import { mkdir, writeFile } from 'fs/promises';
import { basename, resolve } from 'path';

function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const inputName = process.argv.slice(2).join(' ').trim();

  if (!inputName) {
    throw new Error(
      'Please provide a migration name, e.g. npm run migration:create -- add-product-search-index',
    );
  }

  const safeName = normalizeName(inputName);
  const timestamp = Date.now();
  const fileName = `${timestamp}-${safeName}.ts`;
  const directory = resolve(process.cwd(), 'src/database/migrations');
  const fullPath = resolve(directory, fileName);

  await mkdir(directory, { recursive: true });

  const template = `import { DataSource } from 'typeorm';
import { MongoMigration } from './migration.interface';

export default {
  name: '${timestamp}-${safeName}',
  async up(dataSource: DataSource): Promise<void> {
    void dataSource;
  },
  async down(dataSource: DataSource): Promise<void> {
    void dataSource;
  },
} satisfies MongoMigration;
`;

  await writeFile(fullPath, template, 'utf8');
  console.log(`Created migration: ${basename(fullPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
