import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { appEntities } from './entities';

const mongoUrl = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017';
const mongoDatabase = process.env.MONGODB_DB ?? 'ecommerce';

export default new DataSource({
  type: 'mongodb',
  url: mongoUrl,
  database: mongoDatabase,
  entities: appEntities,
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
