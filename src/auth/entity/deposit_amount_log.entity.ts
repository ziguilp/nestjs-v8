import { DepositAmountLogTypeDto } from "src/common/dto/user.dto";
import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("deposit_amount_log")
export class DepositAmountLog extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: 'userId'
    })
    @Index()
    user_id: string;
    
    @Column({
        nullable: true,
        comment: '涉及单号',
    })
    @Index()
    order_sn: string;

    @Column({
        comment: '变更类型',
    })
    type: DepositAmountLogTypeDto;

    @Column({
        default: 0,
        comment: '变更前押金账户余额[分]'
    })
    before_amount: number;

    @Column({
        default: 0,
        comment: '变更额[分]'
    })
    amount: number;

    @Column({
        default: 0,
        comment: '变更后押金账户余额[分]'
    })
    after_amount: number;

    @Column({
        type: "text",
        nullable: true,
        comment: '备注'
    })
    remark: string;

    @CreateDateColumn({
        type: "timestamptz"
    })
    date_created: Date;
}