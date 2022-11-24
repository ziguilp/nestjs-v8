import { OrderType } from 'src/order/dto/order.dto';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OrderGoodsSettleStatus, OrderGoodsStatus, OrderGoodsType } from '../dto/orderGoods.dto';

/**
 * 订单内物entity
 */
@Entity("order_goods")
export class OrderGoods extends BaseEntity {
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
        comment: "订单号"
    })
    @Index()
    order_sn: string;

    @Column({
        comment: '商户ID',
        default: 0
    })
    @Index()
    merchant_id: number;

    @Column({
        type: 'int2',
        comment: "物品类型",
        enum: OrderGoodsType
    })
    @Index()
    goods_type: OrderGoodsType;


    @Column({
        comment: "物品ID/会员礼plan_id",
    })
    @Index()
    goods_id: number;

    @Column({
        type: 'int2',
        comment: "数量",
        nullable: false
    })
    goods_num: number;

    @Column({
        type: 'int4',
        comment: "SKU:商品SKU/会员礼plan_item_id",
        nullable: true
    })
    sku_id: number;

    @Column({
        type: 'int4',
        comment: "原单价[分]",
        nullable: true
    })
    original_price: number;

    @Column({
        type: 'int4',
        comment: "现单价[分]",
        nullable: true
    })
    price: number;

    @Column({
        type: 'int4',
        comment: "优惠金额[分]",
        default: 0,
        nullable: true
    })
    discount: number;

    @Column({
        type: 'int4',
        comment: "商品总原价[分] = 原单价 * 数量",
        default: 0,
        nullable: true
    })
    total_original_amount: number;

    @Column({
        type: 'int4',
        comment: "商品总价[分] = 现单价 * 数量 - 优惠金额",
        default: 0,
        nullable: true
    })
    total_amount: number;

    @Column({
        type: 'int4',
        comment: "已退金额[分]",
        default: 0,
        nullable: true
    })
    refund_amount: number;

    @Column({
        comment: '状态',
        type: 'int2',
        enum: OrderGoodsStatus
    })
    status: OrderGoodsStatus;

    @Column({
        type: 'int4',
        comment: '对商户的结算金额[实际给商户的]',
        nullable: true,
        default: 0
    })
    settle_amount: number;

    @Column({
        type: 'int4',
        comment: '商户结算服务费',
        nullable: true,
        default: 0
    })
    settle_fee: number;

    @Column({
        type: 'int2',
        comment: '对商户的结算状态',
        enum: OrderGoodsSettleStatus
    })
    settle_status: OrderGoodsSettleStatus;

    @Column({
        comment: "商品备注",
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

    @Column({
        nullable: true,
        type: "timestamptz"
    })
    date_deleted: Date;
}
