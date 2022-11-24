import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, Min, min, MIN } from "class-validator";

/**
 * 退款状态
 */
export enum RefundRecordStatusDto {
    /**
     * 退款中
     */
    REFUNDING,
    /**
     * 退款成功
     */
    REFUNDED,
    /**
     * 退款失败
     */
    FAILED,
}


export class RefundApplyDto {
    @ApiProperty({
        name: 'orderGoodsId',
        description: '订单商品表ID'
    })
    @IsNotEmpty()
    @IsInt()
    orderGoodsId: number;

    @ApiProperty({
        name: 'refundAmount',
        description: '退款金额[分]'
    })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    refundAmount: number;

    @ApiProperty({
        name: 'reason',
        description: '退款原因'
    })
    @IsNotEmpty()
    reason: string;
}