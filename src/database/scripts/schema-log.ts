async function main() {
  console.log('MongoDB with TypeORM does not generate SQL migration diffs.');
  console.log('Use:');
  console.log('  npm run schema:sync');
  console.log('  npm run migration:create -- your-migration-name');
  console.log('  npm run migration:run');
  console.log('  npm run migration:revert');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
