import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

/**
 * 订单日志
 */
@Entity("order_log")
export class OrderLog extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'uuid',
        nullable: true,
        comment: '操作者'
    })
    user_id: string;

    @Column({
        default: null,
        nullable: true,
        length: 64,
        comment: "订单号"
    })
    @Index()
    order_sn: string;

    @Column({
        default: ``,
        comment: '操作'
    })
    operation: string;

    @Column({
        default: ``,
        nullable: true,
        comment: 'IP'
    })
    ip: string;

    @CreateDateColumn({
        type: "timestamptz"
    })
    date_created: Date;

}