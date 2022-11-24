import { UserInfoDto } from "src/common/dto/auth.dto";
import { CreateOrderDto, OrderCreateResult } from "src/order/dto/order.dto";
import { Order } from "src/order/entity/order.entity";
import { OrderGoods } from "src/order/entity/orderGoods.entity";
import { Payment } from "src/payment/entity/payment.entity";

/**
 * 订单类
 */
export abstract class OrderLib {

    /**
     * 创建订单
     */
    abstract create(user: UserInfoDto, createOrderDto: CreateOrderDto): Promise<OrderCreateResult>;


    /**
     * 取消订单
     */
    abstract cancel(order: Order): Promise<boolean>;

    /**
     * 订单支付完成回调
     */
    abstract payDone(order: Order, payment: Payment): Promise<boolean>;

    /**
    * 订单申请退款
    */
    abstract refundApply(orderGoods: OrderGoods, refundAmount: number, reason: string): Promise<boolean>;

    /**
    * 订单退款完成
    */
    abstract refundDone(orderGoods: OrderGoods, refundAmount: number, reason: string): Promise<boolean>;


    /**
    * 订单完成收货
    */
    abstract receiveDone(orderGoodsList: OrderGoods[]): Promise<boolean>;
}