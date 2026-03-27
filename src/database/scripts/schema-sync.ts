import dataSource from '../data-source';

async function main() {
  await dataSource.initialize();

  try {
    await dataSource.synchronize();
    console.log('MongoDB schema sync completed successfully.');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
