import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";



@Table
export class User extends Model {
    @PrimaryKey
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    declare id: string;

    @Unique
    @Column
    declare address: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: true }) // nullable if no referrer
    declare referredById?: string;

    @BelongsTo(() => User, "referredById")
    referrer?: User;

    @HasMany(() => User, "referredById")
    referredUsers: User[];

    @Column({type: DataType.DOUBLE, defaultValue: 0})
    declare invested: number;

    // Optional custom referral rate in percent (e.g., 5 for 5%)
    @Column({ type: DataType.DOUBLE, allowNull: true })
    declare customReferralPct?: number | null;
}