import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIdentitySchema1772756704840 implements MigrationInterface {
  name = 'CreateIdentitySchema1772756704840';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "identity"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS "identity"`);
  }
}
