import { CACHE_MANAGER, forwardRef, Inject, Logger, NotFoundException } from '@nestjs/common';
import { ServiceUnavailableException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import * as moment from 'moment';
import { UserInfoDto } from 'src/common/dto/auth.dto';
import { RefundRecordStatusDto } from 'src/payment/dto/refund.dto';
import { Payment } from 'src/payment/entity/payment.entity';
import { PaymentLib } from 'src/payment/lib/payment.lib';
import { PaymentService } from 'src/payment/service/payment.service';
import { Connection, EntityManager, getManager, In } from 'typeorm';
import { ApplyRefundDto, CreateOrderDto, OrderStatus, OrderType } from '../dto/order.dto';
import { OrderGoodsType } from '../dto/orderGoods.dto';
import { Order } from '../entity/order.entity';
import { OrderGoods } from '../entity/orderGoods.entity';
import { OrderLog } from '../entity/orderLog.entity';
import { GiftSubscribeOrderLib } from './lib/giftSubscribeOrderLib.lib';

@Injectable()
export class OrderService {

    private logger: Logger = new Logger(OrderService.name)

    constructor(@Inject(REQUEST) private readonly request: Request,
        private readonly connection: Connection,
        @Inject(forwardRef(() => PaymentService)) private readonly paymentService: PaymentService,
        @Inject(CACHE_MANAGER) private cache: Cache) {
    };


    /**
     * 生成订单
     * 
     */
    async createOrder(user: UserInfoDto, createOrderDto: CreateOrderDto) {

        this.logger.debug(`=====创建订单=====`, user.id)

        const res = await getManager().transaction(async (manager) => {
            let res = null;

            if (createOrderDto.orderType === OrderType.VIP_ORDER) {
                const lib = new GiftSubscribeOrderLib(manager)
                res = await lib.create(user, createOrderDto)
            }
            return res
        })

        if (!res) {
            throw new ServiceUnavailableException(`订单创建失败`)
        }

        return res
    }

    /**
     * 取消订单
     */
    async cancelOrder(orderSn: string): Promise<boolean> {

        return await getManager().transaction(async (manager) => {
            const order = await Order.findOne({ order_sn: orderSn });
            if (!order) {
                throw new ServiceUnavailableException("订单不存在");
            }

            if (order.status == OrderStatus.CANCEL) {
                throw new ServiceUnavailableException("订单已经取消过了");
            }

            if (order.status != OrderStatus.PAYDONE) {
                throw new ServiceUnavailableException("订单状态不支持");
            }

            let res = false;

            if (order.order_type === OrderType.VIP_ORDER) {
                const lib = new GiftSubscribeOrderLib(manager)
                res = await lib.cancel(order)
            }

            if (!res) {
                throw new ServiceUnavailableException(`取消失败`)
            }

            // 更新订单状态
            const updateOrder = await manager.createQueryBuilder()
                .update(Order)
                .where({
                    id: order.id
                })
                .set({
                    status: OrderStatus.REFUND_ALL
                })
                .execute()

            if (updateOrder.affected != 1) {
                throw new ServiceUnavailableException(`取消失败:02`)
            }

            if (order.total_amount > 0) {
                try {
                    this.logger.debug(`执行退款`)
                    const refundRecord = await this.paymentService.refund(order, order.total_amount, '订单取消')
                    if (refundRecord.status === RefundRecordStatusDto.FAILED) {
                        throw new ServiceUnavailableException(`执行退款失败`)
                    }
                } catch (error) {
                    this.logger.debug(`==订单${order.order_sn}执行退款失败==`)
                    this.logger.error(error)
                    throw new ServiceUnavailableException(`${error.message}`)
                }
            }

            await this.orderLog(OrderLog.create({
                order_sn: order.order_sn,
                operation: `订单取消:${res ? "成功" : "失败"}`,
            }), manager)

            return res
        })
    }

    /**
     * 订单申请退款
     * @param orderGoodsId
     * @param reason
     * @returns 
     */
    async applyRefund(data: ApplyRefundDto) {


        return await getManager().transaction(async (manager) => {
            const orderGoods = await manager.getRepository(OrderGoods)
                .createQueryBuilder().where({
                    id: data.orderGoodsId
                }).getOneOrFail()

            if (orderGoods.total_amount <= orderGoods.refund_amount) {
                throw new ServiceUnavailableException("已经退过款了");
            }

            if (orderGoods.total_amount < orderGoods.refund_amount + data.refundAmount) {
                throw new ServiceUnavailableException("超出可退款金额");
            }

            // const order = await Order.findOne({ order_sn: orderSn });
            // if (!order) {
            //     throw new ServiceUnavailableException("订单不存在");
            // }

            // if (order.status == OrderStatus.CANCEL) {
            //     throw new ServiceUnavailableException("订单已经取消过了");
            // }

            // if (order.status != OrderStatus.PAYDONE) {
            //     throw new ServiceUnavailableException("订单状态不支持");
            // }

            let res = false;

            if (orderGoods.goods_type === OrderGoodsType.VIP_ORDER) {
                const lib = new GiftSubscribeOrderLib(manager)
                res = await lib.refundApply(orderGoods, data.refundAmount, data.reason)
            }

            if (!res) {
                throw new ServiceUnavailableException(`取消失败`)
            }

            const order = await manager.getRepository(Order).createQueryBuilder()
                .where({
                    order_sn: orderGoods.order_sn
                })
                .getOneOrFail()


            const totalRefund = await PaymentLib.getTotalRefundedByOrderOrdersn(orderGoods.order_sn)

            // 更新订单状态
            const updateOrder = await manager.createQueryBuilder()
                .update(Order)
                .where({
                    order_sn: orderGoods.order_sn
                })
                .set({
                    status: totalRefund < order.total_amount ? OrderStatus.REFUND_PARTLY : OrderStatus.REFUND_ALL
                })
                .execute()

            if (updateOrder.affected != 1) {
                throw new ServiceUnavailableException(`取消失败:02`)
            }

            if (order.total_amount > 0) {
                try {
                    this.logger.debug(`执行退款`)
                    const refundRecord = await this.paymentService.refund(order, data.refundAmount, data.reason)
                    if (refundRecord.status === RefundRecordStatusDto.FAILED) {
                        throw new ServiceUnavailableException(`执行退款失败`)
                    }
                } catch (error) {
                    this.logger.debug(`==订单${order.order_sn}执行退款失败==`)
                    this.logger.error(error)
                    throw new ServiceUnavailableException(`${error.message}`)
                }
            }

            await this.orderLog(OrderLog.create({
                order_sn: orderGoods.order_sn,
                operation: `订单申请退款:${res ? "成功" : "失败"}`,
            }), manager)


            return res;
        })
    }

    /**
     * 支付完成回调
     * @param orderSn 
     * @returns 
     */
    async payDone(orderSn: string, payment: Payment) {
        this.logger.debug(`=====支付回调=====`, orderSn)

        const lockKey = `operator_lock_order_paydone:${orderSn}`
        const lock = await this.cache.get(lockKey)
        if (lock) {
            throw new ServiceUnavailableException(`回调正在处理中`)
        }
        try {

            await this.cache.set(lockKey, 1, {
                ttl: 30
            })

            return await getManager().transaction(async (manager) => {
                let res = null;

                let order = await manager.getRepository(Order).findOneOrFail({
                    order_sn: orderSn
                })

                if (order.order_type === OrderType.VIP_ORDER) {
                    const lib = new GiftSubscribeOrderLib(manager)
                    res = await lib.payDone(order, payment)
                }


                if (!res) {
                    throw new ServiceUnavailableException(`订单创建失败`)
                }

                return res
            })


        } catch (error) {
            this.logger.debug(`==支付回调出错${orderSn}==`)
            this.logger.error(error)
            throw error
        } finally {
            this.logger.debug(`==回调处理完成，删除锁==`)
            await this.cache.del(lockKey)
        }
    }

    /**
     * 订单操作日志
     */
    async orderLog(log: OrderLog, manager?: EntityManager) {

        if (!manager) {
            manager = getManager()
        }

        try {
            const user: any = this.request.user;
            log.user_id = user?.id;
            log.ip = this.request.clientIp || '';
            return await manager.save(log)
        } catch (error) {
            this.logger.error(error)
        }
    }
}
