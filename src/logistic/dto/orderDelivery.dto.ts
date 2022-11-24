import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

/**
 * 物流公司
 */
export enum ExpressCom {
    /**
     * 京东
     */
    JDL = 'JDL'
}

/**
 * 运单状态
 */
export enum OrderDeliveryStatus {
    /**
     * 已废弃
     */
    ABANDON,
    /**
     * 待绑定物流单
     */
    UNTRACK,
    /**
     * 待揽收
     */
    PACKING,
    /**
     * 运输中
     */
    TRANSING,
    /**
     * 已送达
     */
    RECEIVED,
    /**
    * 发货异常
    */
    EXCEPTION,
    /**
     * 退回中
     */
    REFUNDING,
    /**
    * 退回完成
    */
    REFUNDED,
    /**
    * 退回异常
    */
    REFUNDEXCEPTION,
}

/**
 * 绑定物流单
 */
export class BindWlOrderDto {
    @ApiProperty({
        name: 'orderSn'
    })
    @IsNotEmpty()
    orderSn: string

    @ApiProperty({
        name: 'expressCom',
    })
    @IsNotEmpty()
    expressCom: ExpressCom

    @ApiProperty({
        name: 'expressNo',
    })
    @IsNotEmpty()
    expressNo: string
}