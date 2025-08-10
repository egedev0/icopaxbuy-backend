import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { TOKENS_TYPE, TXNS_TYPE } from "../config/txn";
import { User } from "../users/users.model";


@Table
export class Txn extends Model {
    @PrimaryKey
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    declare id: string;

    @ForeignKey(() => User)
    @Column({type: DataType.UUID})
    declare usrId: string;

    @Column({type: DataType.ENUM(TOKENS_TYPE.bnb, TOKENS_TYPE.usdt)})
    declare token: string;

    @Column({type: DataType.DOUBLE})
    declare amount: number;

    @Column({type: DataType.DOUBLE})
    declare usdValue: number;

    @Column
    declare hash: string;

    @Column
    declare isVesting: boolean;

    @Column({type: DataType.ENUM(TXNS_TYPE.buy, TXNS_TYPE.referral), defaultValue: TXNS_TYPE.buy})
    declare type : string;

    @ForeignKey(() => User)
    @Column({type: DataType.UUID})
    declare refereeId: string;

    @BelongsTo(() => User, "usrId")
    user: User;

    @BelongsTo(() => User, "refereeId")
    referee: User;
}