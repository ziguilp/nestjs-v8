import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TradeStatus, TradeWay } from '../dto/pay.dto';

/**
 * 订单entity
 */
@Entity("payment")
export class Payment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'uuid',
        comment: '用户ID'
    })
    user_id: string;

    @Column({
        type: 'int4',
        comment: '商户ID'
    })
    merchant_id: number;

    @Column({
        length: 64,
        comment: "order订单号"
    })
    @Index()
    order_order_sn: string;


    @Column({
        length: 64,
        comment: "和三方进行交易的订单号"
    })
    @Index({ unique: true })
    order_sn: string;

    @Column({
        comment: "第三方订单号",
        nullable: true
    })
    third_order_sn: string;

    @Column({
        comment: "交易内容",
    })
    desc: string;

    @Column({
        comment: "交易金额(分)",
        default: 0,
        type: "int4"
    })
    payment_amount: number;

    @Column({
        comment: "累计退款金额(分)",
        default: 0,
        type: "int4"
    })
    refund_total_amount: number;

    @Column({
        comment: "交易备注",
        nullable: true
    })
    remark: string;

    @Column({
        comment: "交易状态",
        enum: TradeStatus,
        default: TradeStatus.TRADE_PAYING,
        type: "int2"
    })
    status: TradeStatus;

    @Column({
        comment: "交易方式:" + Object.values(TradeWay).join("/"),
        enum: TradeWay,
        type: "varchar"
    })
    trade_way: TradeWay;

    @Column({
        comment: "交易APPID",
        type: "varchar",
        nullable: true
    })
    appid: string;

    @Column({
        comment: "商户ID",
        type: "varchar",
        nullable: true,
    })
    mchid: string;


    @Column({
        comment: "交易内容数据",
        type: 'jsonb',
        nullable: true
    })
    third_trade_data: Object

    @UpdateDateColumn({
        comment: '支付完成时间',
        default: null,
        nullable: true,
        type: "timestamptz"
    })
    date_paydone: Date;

    @CreateDateColumn({
        type: "timestamptz"
    })
    date_created: Date;

    @UpdateDateColumn({
        type: "timestamptz"
    })
    date_updated: Date;


    @Column({
        nullable: true,
        type: "timestamptz"
    })
    date_deleted: Date;
}
