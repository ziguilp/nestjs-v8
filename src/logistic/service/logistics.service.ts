import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { BindWlOrderDto, OrderDeliveryStatus } from "../dto/orderDelivery.dto";
import { OrderDelivery } from "../entity/logistic.entity";

@Injectable()
export class LogisticsService {
    constructor() {

    }

    /**
     * 下物流单
     */
    async createWlOrder(order_delivery: OrderDelivery) {

    }

    /**
     * 绑定发货物流单
     */
    async bindWlOrder(data: BindWlOrderDto) {
        const order_delivery = await OrderDelivery.findOneOrFail({
            order_sn: data.orderSn,
        })
        if (order_delivery.status != OrderDeliveryStatus.UNTRACK && order_delivery.status != OrderDeliveryStatus.EXCEPTION) {
            throw new ServiceUnavailableException(`物流单状态错误`)
        }
        order_delivery.express_com = data.expressCom;
        order_delivery.express_no = data.expressNo;
        return await order_delivery.save()
    }

    /**
     * 绑定退货物流单
     */
    async bindRefundWlOrder(data: BindWlOrderDto) {
        const order_delivery = await OrderDelivery.findOneOrFail({
            order_sn: data.orderSn,
        })
        if (order_delivery.status != OrderDeliveryStatus.EXCEPTION && order_delivery.status != OrderDeliveryStatus.RECEIVED) {
            throw new ServiceUnavailableException(`物流单状态错误`)
        }
        order_delivery.refund_express_com = data.expressCom;
        order_delivery.refund_express_no = data.expressNo;
        order_delivery.status = OrderDeliveryStatus.REFUNDING;
        return await order_delivery.save()
    }

    /**
     * 下退货单
     */
    async createRefundOrder(order_delivery: OrderDelivery) {

    }

    /**
     * 物流信息同步
     */
    async syncWlRoute() {

    }
}