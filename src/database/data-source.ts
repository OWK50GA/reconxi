import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategy';

export const dataSourceOptions = {
  type: 'postgres' as const,
  // ...same options as above, synchronize: false
  namingStrategy: new SnakeNamingStrategy(),
};

export default new DataSource(dataSourceOptions);
