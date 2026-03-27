import { DataSource } from 'typeorm';
import { MongoMigration } from './migration.interface';

export default {
  name: '1774611136471-firstmigration',
  async up(dataSource: DataSource): Promise<void> {
    void dataSource;
  },
  async down(dataSource: DataSource): Promise<void> {
    void dataSource;
  },
} satisfies MongoMigration;
