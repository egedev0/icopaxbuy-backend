import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from '../users/users.model';

export enum REFERRAL_PAYOUT_STATUS {
  pending = 'pending',
  completed = 'completed',
  failed = 'failed',
}

@Table
export class ReferralPayout extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  declare usrId: string;

  @BelongsTo(() => User, 'usrId')
  user?: User;

  @Column({ type: DataType.STRING })
  declare toAddress: string;

  @Column({ type: DataType.DOUBLE })
  declare amountUsd: number;

  @Column({
    type: DataType.ENUM(
      REFERRAL_PAYOUT_STATUS.pending,
      REFERRAL_PAYOUT_STATUS.completed,
      REFERRAL_PAYOUT_STATUS.failed
    ),
    defaultValue: REFERRAL_PAYOUT_STATUS.pending,
  })
  declare status: REFERRAL_PAYOUT_STATUS;

  @Column({ allowNull: true })
  declare txHash?: string | null;
}

