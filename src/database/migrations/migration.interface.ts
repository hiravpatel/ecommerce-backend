import { DataSource } from 'typeorm';

export interface MongoMigration {
  name: string;
  up(dataSource: DataSource): Promise<void>;
  down(dataSource: DataSource): Promise<void>;
}
