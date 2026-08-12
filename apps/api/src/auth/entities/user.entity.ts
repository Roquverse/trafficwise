import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum Role {
  COMMUTER = 'Commuter',
  OPS = 'Ops',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.COMMUTER,
  })
  role: Role;
}
