import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty } from "class-validator";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ReportStatus, ReportType } from "../dto/report.dto";

/**
 * 举报
 */
@Entity("ilegal_report")
export class ILegalReport extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'uuid',
        comment: '举报人',
        nullable: true
    })
    user_id: string;

    @Column({
        comment: '举报对象类型'
    })
    @ApiProperty({
        description: '举报对象类型',
        enum: ReportType
    })
    @Index()
    @IsIn(Object.values(ReportType))
    type: ReportType;

    @Column({
        comment: '举报对象ID'
    })
    @ApiProperty({
        description: '举报对象ID'
    })
    @Index()
    @IsNotEmpty()
    object_id: number;

    @Column({
        comment: '投诉原因'
    })
    @ApiProperty()
    @IsNotEmpty()
    reason: string;

    @Column({
        type: 'int2',
        default: ReportStatus.UNDEAL,
        comment: '状态'
    })
    @IsNotEmpty()
    status: ReportStatus;

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