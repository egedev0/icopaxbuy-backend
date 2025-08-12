import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table
export class Setting extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING })
  declare key: string;

  @Column({ type: DataType.TEXT })
  declare value: string;
}

