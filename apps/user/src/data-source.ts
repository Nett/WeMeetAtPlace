import { DataSource } from 'typeorm';
import { join } from 'node:path';

// Load .env before connecting (dotenv is a dependency of @nestjs/config)
require('dotenv').config({ path: join(process.cwd(), 'apps', 'user', '.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT
    ? parseInt(process.env.POSTGRES_PORT, 10)
    : 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [join(process.cwd(), 'apps', 'user', 'entities', '**', '*.entity.{ts,js}')],
  migrations: [join(process.cwd(), 'apps', 'user', 'migrations', '*.{ts,js}')],
  synchronize: false,
});
