import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IDENTITY_SCHEMA } from "./identity.schema";

@Entity({schema: IDENTITY_SCHEMA, name: 'user' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({unique: true})
    @Column({type: 'varchar', length: 20, nullable: false})
    nickname: string;

    @Index({unique: true})
    @Column({type: 'varchar', length: 150, nullable: false})
    email: string;

    @Column({type: 'varchar', length: 255, nullable: false, select: false})
    password: string;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    avatar?: string;

    @CreateDateColumn({ type: 'timestamp without time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp without time zone' })
    updated_at: Date;
}