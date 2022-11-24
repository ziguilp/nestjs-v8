import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index, DeleteDateColumn } from 'typeorm';
import { AppPlatform, AppVersionStatus } from '../dto/appVersion.dto';
import { IsAppVersion } from '../validators/version.validator';

/**
 * 版本管理entity
 */
@Entity("app_version")
export class AppVersion extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;


    @Column({
        type: 'varchar',
        comment: '平台'
    })
    @ApiProperty({
        description: '平台',
        enum: AppPlatform,
    })
    @IsNotEmpty()
    @Index()
    @IsIn(Object.values(AppPlatform))
    platform: AppPlatform;

    @Column({
        type: 'varchar',
        nullable: false,
        comment: '当前版本号'
    })
    @ApiProperty({
        description: '当前版本号',
    })
    @IsNotEmpty()
    @IsAppVersion({
        message: '版本号无效'
    })
    version: string;

    @Column({
        type: 'int4',
        nullable: false,
        comment: '当前版本号值'
    })
    @Index()
    version_val: number;

    @Column({
        type: 'jsonb',
        default: null,
        nullable: true,
        comment: '受影响的版本号(所选版本必须升级到当前新版本)'
    })
    @ApiProperty({
        description: '受影响的版本(所选版本必须升级到当前新版本)',
        enum: AppPlatform,
    })
    @IsOptional()
    @IsAppVersion({
        each: true
    })
    old_versions: string[];

    @Column({
        type: 'varchar',
        nullable: false,
        comment: '当前版本包大小'
    })
    @ApiProperty({
        description: '当前版本包大小',
    })
    @IsNotEmpty()
    package_size: string;

    @Column({
        nullable: false,
        comment: '升级内容',
        length: 256
    })
    @ApiProperty({
        description: '升级内容',
    })
    @IsNotEmpty()
    content: string;

    @Column({
        nullable: false,
        comment: '下载链接',
        length: 256
    })
    @ApiProperty({
        description: '下载链接',
    })
    @IsNotEmpty()
    @IsUrl()
    download: string;


    @Column({
        type: 'boolean',
        default: false,
        nullable: false,
        comment: '是否强制更新',
    })
    @ApiProperty({
        description: '是否强制更新',
    })
    enforce: boolean;

    @Column({
        type: 'int2',
        default: AppVersionStatus.DRAFT,
        nullable: false,
        comment: '状态',
    })
    @ApiProperty({
        description: '状态',
    })
    status: AppVersionStatus;

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