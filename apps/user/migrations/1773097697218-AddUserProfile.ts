import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfile1773097697218 implements MigrationInterface {
    name = 'AddUserProfile1773097697218'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "identity"."user" ("id" SERIAL NOT NULL, "nickname" character varying(20) NOT NULL, "email" character varying(150) NOT NULL, "password" character varying(255) NOT NULL, "avatar" character varying(1000), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e2364281027b926b879fa2fa1e" ON "identity"."user" ("nickname") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "identity"."user" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "identity"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP INDEX "identity"."IDX_e2364281027b926b879fa2fa1e"`);
        await queryRunner.query(`DROP TABLE "identity"."user"`);
    }

}
