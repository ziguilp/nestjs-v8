import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

/**
 * 地址
 */
@Entity("user_address")
export class UserAddress extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'uuid',
        nullable: true,
        comment: '用户'
    })
    @Index()
    user_id: string;

    @Column({
        default: null,
        nullable: true,
        comment: '省'
    })
    @Index()
    province: string;

    @Column({
        default: null,
        nullable: true,
        comment: '市'
    })
    @Index()
    city: string;

    @Column({
        default: ``,
        nullable: true,
        comment: '区县'
    })
    @Index()
    area: string;

    @Column({
        default: ``,
        nullable: true,
        comment: '详细地址'
    })
    @Index()
    detail: string;

    @Column({
        default: ``,
        nullable: true,
        comment: '收件人'
    })
    @Index()
    name: string;

    @Column({
        default: ``,
        nullable: true,
        comment: '联系电话'
    })
    @Index()
    mobile: string;

    @CreateDateColumn({
        type: "timestamptz"
    })
    date_created: Date;


    @DeleteDateColumn({
        nullable: true,
        type: "timestamptz"
    })
    date_deleted: Date;

}