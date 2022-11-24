import { OrderStatus, OrderType } from 'src/order/dto/order.dto';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index, DeleteDateColumn } from 'typeorm';

/**
 * 订单entity
 */
@Entity("order")
export class Order extends BaseEntity {
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
        unique: true,
        comment: "订单号"
    })
    @Index({ unique: true })
    order_sn: string;

    @Column({
        comment: "订单状态",
        nullable: true,
        default: OrderStatus.BEFORE_PAY,
        enum: OrderStatus
    })
    @Index()
    status: OrderStatus;

    @Column({
        comment: "订单类型",
        enum: OrderType
    })
    @Index()
    order_type: OrderType;

    @Column({
        comment: '商户ID',
        default: 0
    })
    @Index()
    merchant_id: number;

    @Column({
        comment: "订单总额原价(分)",
        default: 0
    })
    total_original_amount: number;


    @Column({
        comment: "订单总额现价(分)",
        default: 0
    })
    total_amount: number;


    @Column({
        comment: "订单标题",
        default: ``
    })
    trade_title: string;


    @Column({
        comment: "订单备注",
        nullable: true
    })
    remark: string;


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
