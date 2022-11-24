import { VipSubscribeLogType } from 'src/common/dto/user.dto';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';

/**
 * 订单entity
 */
@Entity("vip_subscribe_log")
export class vipSUbscribeLog extends BaseEntity {
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
        nullable: true,
        comment: "order订单号"
    })
    @Index()
    order_order_sn: string;


    @Column({
        comment: "类型",
        enum: VipSubscribeLogType
    })
    type: number;


    @Column({
        comment: "变更时长s",
        default: 0,
    })
    interval: number;


    @Column({
        comment: "备注",
        nullable: true
    })
    remark: string;


    @CreateDateColumn({
        type: "timestamptz"
    })
    date_created: Date;
}
