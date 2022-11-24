import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsNotEmpty, Length, Min } from "class-validator";
import { UserAddress } from "src/auth/entity/userAddress.entity";
import { Order } from "../entity/order.entity";
import { OrderGoods } from "../entity/orderGoods.entity";
import { CreateOrderGoodsItem } from "./orderGoods.dto";

/**
 * 订单类型
 */
export enum OrderType {
    /**
     * 会员订阅订单
     */
    VIP_ORDER,
    /**
     * 商品购买订单
     */
    GOODS,
    /**
     * 会员礼履约订单
     */
    GIFTS
}


/**
 * 订单状态
 */
export enum OrderStatus {
    /**
     * 已作废
     */
    CANCEL,

    /**
     * 待支付
     */
    BEFORE_PAY,

    /**
     * 已支付
     */
    PAYDONE,

    /**
     * 部分已退款
     */
    REFUND_PARTLY,

    /**
     * 全部已退款
     */
    REFUND_ALL,
}


export interface OrderCreateResult {
    order: Order,
    orderGoodsList: OrderGoods[],
}

export class CreateOrderDto {
    @ApiProperty({
        type: OrderType,
        enum: OrderType
    })
    @IsNotEmpty()
    @IsIn(Object.values(OrderType))
    orderType: OrderType

    @ApiProperty({
    })
    @IsNotEmpty()
    orderGoodsList: CreateOrderGoodsItem[]

    @ApiProperty({
        type: UserAddress
    })
    address?: UserAddress

    @ApiProperty({
        type: String
    })
    remark?: string
}

/**
 * 申请退款
 */
export class ApplyRefundDto {
    @ApiProperty({
        type: Number
    })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    orderGoodsId: number

    @ApiProperty({
        description: '退款金额分'
    })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    refundAmount: number

    @ApiProperty({
        description: '原因'
    })
    @IsNotEmpty()
    @Length(1, 20)
    reason: string
}