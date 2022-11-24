import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsUrl, Length } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index, DeleteDateColumn } from 'typeorm';
import { CmsPage } from './cmsPage.entity';

/**
 * 
 */
@Entity("cms_conetent")
export class CmsContent extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: "别名",
        nullable: true
    })
    @Index()
    @ApiProperty({
        description: '别名',
    })
    @IsOptional()
    @Length(6, 64)
    alias: string;

    @Column({
        type: 'int4',
        comment: "页面"
    })
    @Index()
    @ApiProperty({
        description: '页面'
    })
    @IsNotEmpty()
    @IsInt()
    page_id: number;

    @Column({
        comment: "位置",
        nullable: true
    })
    @ApiProperty({
        description: '位置'
    })
    @IsNotEmpty()
    @Length(2, 32)
    position: string;

    @Column({
        type: 'int4',
        comment: "排序[越大越靠前]",
        nullable: false,
        default: 0,
    })
    @ApiProperty({
        description: '排序[越大越靠前]'
    })
    sort: number;

    @Column({
        length: 64,
        comment: "标题"
    })
    @ApiProperty({
        description: '位置'
    })
    @IsNotEmpty()
    @Length(2, 64)
    title: string;

    @Column({
        type: 'text',
        nullable: true,
        comment: "内容"
    })
    @ApiProperty({
        description: '内容'
    })
    content: string;

    @Column({
        length: 255,
        nullable: true,
        comment: "配图/封面"
    })
    @ApiProperty({
        description: '配图/封面'
    })
    @IsOptional()
    @IsUrl()
    image: string;

    @Column({
        type: 'jsonb',
        nullable: true,
        comment: "配置"
    })
    @ApiProperty({
        description: '额外配置'
    })
    @IsOptional()
    extra: { [key: string]: any };

    @Column({
        type: "uuid",
        nullable: true
    })
    user_created: string;

    @Column({
        type: "timestamptz"
    })
    @ApiProperty({
        description: '有效期开始时间'
    })
    date_show_start: Date;

    @Column({
        type: "timestamptz"
    })
    @ApiProperty({
        description: '有效期结束时间'
    })
    date_show_end: Date;

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

    @ManyToOne(type => CmsPage, cmsPage => cmsPage.contents)
    @JoinColumn({ name: "page_id" })
    cmsPage: CmsPage;
}
