import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("vipcard")
export class VipCard extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: "会员卡名称"
    })
    name: string;

    @Column({
        comment: "会员天数"
    })
    days: number;

    @Column({
        comment: "价格[分]"
    })
    price: number;

    @Column({
        comment: "原价格[分]",
        nullable: true,
        default: 0
    })
    original_price: number;

    @Column({
        comment: "图片",
        nullable: true
    })
    image: string;

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