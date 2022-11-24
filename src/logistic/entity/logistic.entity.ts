import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ExpressCom, OrderDeliveryStatus } from "../dto/orderDelivery.dto";

@Entity("order_delivery")
export class OrderDelivery extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: "商户ID"
    })
    @Index()
    merchant_id: number;

    @Column({
        length: 64,
        comment: "订单号"
    })
    @Index()
    order_sn: string;

    @Column({
        type: 'uuid',
        comment: "用户ID",
        nullable: false,
    })
    @Index()
    user_id: string;

    @Column({
        type: 'int2',
        comment: "状态",
        nullable: false,
    })
    @Index()
    status: OrderDeliveryStatus;

    @Column({
        default: null,
        nullable: true,
        comment: '省'
    })
    province: string;

    @Column({
        default: null,
        nullable: true,
        comment: '市'
    })
    city: string;

    @Column({
        default: ``,
        nullable: true,
        comment: '区县'
    })
    area: string;

    @Column({
        default: ``,
        nullable: true,
        comment: '详细地址'
    })
    detail: string;

    @Column({
        default: ``,
        nullable: true,
        comment: '收件人'
    })
    name: string;

    @Column({
        default: ``,
        nullable: true,
        comment: '联系电话'
    })
    mobile: string;

    @Column({
        nullable: true,
        comment: '发货快递公司'
    })
    express_com: ExpressCom;

    @Column({
        nullable: true,
        comment: '发货运单号'
    })
    express_no: string;

    @Column({
        nullable: true,
        comment: '退货快递公司'
    })
    refund_express_com: ExpressCom;

    @Column({
        nullable: true,
        comment: '退运单号'
    })
    refund_express_no: string;

    @Column({
        type: 'jsonb',
        nullable: true,
        comment: '运单接口下单结果'
    })
    express_result: any;

    @Column({
        comment: "备注",
        nullable: true,
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
        type: "timestamptz"
    })
    date_deleted: Date;
}