import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

/**
 * 投诉类型
 */
export enum ReportType {
    /**
     * 电台
     */
    CHANNEL = 'channel',
    /**
     * 节目
     */
    ITEM = 'item',
    /**
     * 评论
     */
    COMMENT = 'comment',
}

/**
 * 投诉状态
 */
export enum ReportStatus {
    /**
     * 待处理
     */
    UNDEAL,
    /**
     * 已处理
     */
    DEALED,
}


/**
 * 节目播放上报
 */
export class PlayReportDto {
    @ApiProperty({
        name: 'itemId',
        description: "节目ID"
    })
    @IsNotEmpty()
    @IsInt()
    itemId: number;


    user_id: string;

    @ApiProperty({
        name: 'timepoint',
        description: "节目当前播放的进度[s]"
    })
    timepoint?: number;
}