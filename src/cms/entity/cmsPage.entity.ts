import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index, DeleteDateColumn } from 'typeorm';
import { CmsContent } from './cmsContent.entity';

/**
 * 
 */
@Entity("cms_page")
export class CmsPage extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 64,
        comment: "页面名称"
    })
    @ApiProperty({
        description: '页面名称'
    })
    @IsNotEmpty({

    })
    @Length(1, 64)
    @Index({ unique: true })
    name: string;


    @Column({
        length: 255,
        nullable: false,
        comment: "路由"
    })
    @ApiProperty({
        description: '页面路由'
    })
    @IsNotEmpty({

    })
    @Length(2, 255)
    @Index({ unique: true })
    link: string;

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

    @OneToMany(type => CmsContent, cmsContent => cmsContent.cmsPage)
    contents: CmsContent[];
}
