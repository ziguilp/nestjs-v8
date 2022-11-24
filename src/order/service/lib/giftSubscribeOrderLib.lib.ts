import { Logger, ServiceUnavailableException } from "@nestjs/common";
import * as moment from "moment";
import { VipCard } from "src/auth/entity/vipcard.entity";
import { UserUtil } from "src/auth/utils/userUtil";
import { UserInfoDto } from "src/common/dto/auth.dto";
import { VipSubscribeLogType } from "src/common/dto/user.dto";
import { CreateOrderDto, OrderCreateResult, OrderStatus, OrderType } from "src/order/dto/order.dto";
import { CreateOrderGoodsItem, OrderGoodsSettleStatus, OrderGoodsStatus, OrderGoodsType } from "src/order/dto/orderGoods.dto";
import { Order } from "src/order/entity/order.entity";
import { OrderGoods } from "src/order/entity/orderGoods.entity";
import { Payment } from "src/payment/entity/payment.entity";
import { generateOrderNo } from "src/utils/util";
import { In } from "typeorm";
import { OrderLib } from "./order.abstract";
import { OrderLibContructor } from "./order.lib";

export class GiftSubscribeOrderLib extends OrderLibContructor implements OrderLib {

    private logger = new Logger(GiftSubscribeOrderLib.name)


    /**
     * 订阅商户会员礼，该订单的所有商品数量固定到1
     * @param user 
     * @param orderGoodsItems 
     * @param address 
     */
    async create(user: UserInfoDto, createOrderDto: CreateOrderDto): Promise<OrderCreateResult> {
        const order_goods_items = createOrderDto.orderGoodsList.filter((e: CreateOrderGoodsItem) => {
            return e.goodsType === OrderGoodsType.VIP_ORDER && e.goodsNum > 0 && e.goodsId > 0;
        });

        if (order_goods_items.length < 1) {
            throw new ServiceUnavailableException(`所选会员礼为空`)
        }

        let vipcards = await VipCard.findByIds(order_goods_items.map(e => e.goodsId))

        let order = Order.create({
            user_id: user.id,
            order_sn: generateOrderNo(),
            order_type: OrderType.VIP_ORDER,
            trade_title: `订阅会员`,
            remark: createOrderDto.remark || ``,
            total_original_amount: 0,
            total_amount: 0,
            status: OrderStatus.BEFORE_PAY
        })

        let orderGoods: OrderGoods[] = [];
        for (let index = 0; index < vipcards.length; index++) {
            const item = vipcards[index];
            const goodsNum = 1;
            const goodsItem = OrderGoods.create({
                user_id: user.id,
                order_sn: order.order_sn,
                goods_id: item.id,
                goods_type: OrderGoodsType.VIP_ORDER,
                goods_num: goodsNum,
                sku_id: item.id,
                original_price: item.original_price,
                price: item.price,
                total_original_amount: item.original_price.mul(goodsNum),
                total_amount: item.price.mul(goodsNum),
                discount: 0,
                status: OrderGoodsStatus.BEFORE_PAY,
                settle_status: OrderGoodsSettleStatus.UNSETTLE,
                remark: (createOrderDto.remark || '')
            })
            orderGoods.push(goodsItem)

            order.total_original_amount += goodsItem.total_original_amount;
            order.total_amount += goodsItem.total_amount;
        }

        return {
            order: await this.entityManager.save(order),
            orderGoodsList: await this.entityManager.save(orderGoods)
        }
    }

    async payDone(order: Order, payment: Payment): Promise<boolean> {

        // 提取订单商品
        const orderGoods = await this.entityManager.getRepository(OrderGoods).createQueryBuilder()
            .where({
                order_sn: order.order_sn,
                goods_type: OrderGoodsType.VIP_ORDER,
                status: OrderGoodsStatus.BEFORE_PAY
            })
            .getMany()

        if (orderGoods.length < 1) {
            throw new ServiceUnavailableException(`回调失败，商品为空`);
        }

        for (let index = 0; index < orderGoods.length; index++) {
            const og: OrderGoods = orderGoods[index];

            const card = await this.entityManager.getRepository(VipCard).createQueryBuilder()
                .where({
                    id: og.goods_id
                })
                .getOneOrFail();

            await UserUtil.addVipInterval(this.entityManager, og.user_id, card.days.mul(86400), og.order_sn, VipSubscribeLogType.PURCHASE_CARD)
        }

        return true
    }

    /**
    * 购买7天内，未发送首单礼，可退
    */
    async cancel(order: Order): Promise<boolean> {

        if (order.order_type !== OrderType.VIP_ORDER) {
            throw new ServiceUnavailableException(`订单类型错误`)
        }

        if (moment().isAfter(moment(order.date_created).add(7, 'days'))) {
            throw new ServiceUnavailableException(`订单购买超过7天无法取消`)
        }

        const orderGoods = await OrderGoods.createQueryBuilder()
            .where({
                order_sn: order.order_sn
            })
            .getOneOrFail()

        if (orderGoods.status !== OrderGoodsStatus.PAYDONE) {
            throw new ServiceUnavailableException(`状态异常`)
        }

        const vipcard = await VipCard.createQueryBuilder().where({
            id: orderGoods.goods_id
        }).withDeleted().getOneOrFail()

        return await UserUtil.addVipInterval(this.entityManager, orderGoods.user_id, vipcard.days.mul(86400), order.order_sn, VipSubscribeLogType.DISTORY, '取消会员')
    }

    /**
     * 享受服务之后申请退款
     * @param orderGoodsList 
     * @returns 
     */
    async refundApply(orderGoods: OrderGoods, refundAmount: number, reason: string): Promise<boolean> {


        return true
    }

    async refundDone(orderGoods: OrderGoods, refundAmount: number, reason: string): Promise<boolean> {
        return true
    }

    async receiveDone(orderGoodsList: OrderGoods[]): Promise<boolean> {
        return true
    }


}