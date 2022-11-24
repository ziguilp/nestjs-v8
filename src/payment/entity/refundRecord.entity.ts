import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RefundRecordStatusDto } from "../dto/refund.dto";

@Entity("refund_record")
export class RefundRecord extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'uuid',
        comment: '用户ID'
    })
    @Index()
    user_id: string;

    @Column({
        length: 64,
        comment: "退款订单号"
    })
    @Index({ unique: true })
    refund_order_sn: string;

    @Column({
        type: 'jsonb',
        comment: "退款订单商品",
        default: '[]'
    })
    refund_order_goods_ids: number[];

    @Column({
        length: 64,
        comment: "订单号"
    })
    @Index()
    order_order_sn: string;

    @Column({
        length: 64,
        comment: "支付订单号"
    })
    @Index()
    payment_order_sn: string;

    @Column({
        length: 64,
        comment: "三方退款订单号",
        nullable: true
    })
    third_order_sn: string;

    @Column({
        comment: "退款金额[分]"
    })
    refund_amount: number;

    @Column({
        comment: "退款原因"
    })
    reason: string;

    @Column({
        comment: "退款状态"
    })
    status: RefundRecordStatusDto;

    @Column({
        comment: "三方数据",
        nullable: true,
        type: 'jsonb'
    })
    third_trade_data: Object;

    @CreateDateColumn({
        nullable: true,
        default: null,
        comment: "退款成功时间",
        type: "timestamptz"
    })
    date_success: Date;

    @CreateDateColumn({
        type: "timestamptz"
    })
    date_created: Date;

    @UpdateDateColumn({
        type: "timestamptz"
    })
    date_updated: Date;

    @DeleteDateColumn({
        nullable: true,
        type: "timestamptz"
    })
    date_deleted: Date;
}