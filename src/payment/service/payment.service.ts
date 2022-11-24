import { forwardRef, Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { ThirdLoginService } from "src/auth/third/login.service";
import { wechatPayConfig } from "src/config";
import { Order } from "src/order/entity/order.entity";
import { OrderService } from "src/order/service/order.service";
import { Connection, getManager, In } from "typeorm";
import { TradeClient, TradeStatus, TradeWay } from "../dto/pay.dto";
import { Payment } from "../entity/payment.entity";
import random from 'string-random';
import { PaymentProvider } from "../lib/payment.provider";
import { ThirdPlatformDto } from "src/auth/third/third.dto";
import { RefundRecord } from "../entity/refundRecord.entity";
import { RefundRecordStatusDto } from "../dto/refund.dto";
import * as moment from "moment";
import { WechatNotifyDecrytedData } from "../dto/wechat.dto";
import { PaymentLib } from "../lib/payment.lib";

@Injectable()
export class PaymentService {

    private logger: Logger = new Logger(PaymentService.name)

    constructor(@Inject(REQUEST) private readonly request: Request, @Inject(forwardRef(() => OrderService)) private readonly orderService: OrderService, private readonly thirdLoginService: ThirdLoginService, private readonly connection: Connection) {

    }

    /**
     * 获取各渠道支付的特殊参数
     * @param user_id
     * @param tradeWay 
     * @param client 
     * @returns 
     */
    async getExParamsForPayLib(user_id: string, tradeWay: TradeWay, client: TradeClient) {

        if (tradeWay === TradeWay.WECHAT_PAY) {

            const thirdUser = await this.thirdLoginService.getThirdInfo(user_id, ThirdPlatformDto.WECHAT_MINIAPP)

            let openid = thirdUser ? thirdUser.third_openid : '';

            let params = {
                appid: process.env.WECHAT_MINIAPPID,
                mchid: wechatPayConfig.mchId,
                openid,
            }
            if (client !== TradeClient.JSAPI) {
                throw new ServiceUnavailableException(`暂不支持：${tradeWay}-${client}`)
            }
            return params
        }
        throw new ServiceUnavailableException(`暂不支持：${tradeWay}-${client}`)
    }

    /**
     * 发起支付
     * @param orderSn 订单号
     * @param tradeWay 交易方式,wechat/ali
     * @param client 交易客户端，微信有native、h5、jsapi、app
     */
    async createPay(orderSn: string, tradeWay: TradeWay, client: TradeClient) {

        const order = await Order.findOne({
            order_sn: orderSn
        })

        if (!order) {
            throw new NotFoundException(`订单不存在`)
        }

        const paied = await Payment.findOne({
            where: {
                order_order_sn: orderSn,
                status: In([TradeStatus.TRADE_DONE, TradeStatus.TRADE_PAYDONE, TradeStatus.TRADE_REFUND])
            }
        })

        if (paied) {
            throw new ServiceUnavailableException(`订单已支付`)
        }

        const extParams = await this.getExParamsForPayLib(order.user_id, tradeWay, client)

        const newpayment = new Payment();
        newpayment.appid = extParams.appid || '';
        newpayment.mchid = extParams.mchid || '';
        newpayment.merchant_id = order.merchant_id;
        newpayment.user_id = order.user_id;
        newpayment.order_order_sn = order.order_sn;
        newpayment.order_sn = `${newpayment.order_order_sn}-${random(6)}`
        newpayment.payment_amount = order.total_amount;
        newpayment.remark = order.remark || ``;
        newpayment.desc = order.trade_title;
        newpayment.trade_way = tradeWay;

        await Payment.save(newpayment)

        const pay = PaymentProvider.init(tradeWay)
        const payres = await pay.createPay({
            order_sn: newpayment.order_sn,
            appid: newpayment.appid,
            desc: newpayment.desc,
            payment_amount: newpayment.payment_amount,
            openid: extParams.openid || '',
            remark: newpayment.remark
        }, client, {
            clientIp: this.request.clientIp || '',
            store_info: {
                name: process.env.SYS_NAME
            },
            h5_info: {
                type: "Wap"
            }
        });
        return {
            order,
            payment: newpayment,
            payres
        }
    }

    /**
     * 未支付订单关闭
     */
    async closePay() {

    }

    /**
     * 订单发起退款
     * @param order 
     * @param refundAmount 退款金额分
     * 
     */
    async refund(order: Order, refundAmount: number, reason: string) {

        if (refundAmount < 0) {
            throw new ServiceUnavailableException(`退款金额有误`)
        }

        try {

            // 校验支付订单
            const payment = await Payment.findOneOrFail({
                order_order_sn: order.order_sn
            })

            if (payment.status != TradeStatus.TRADE_PAYDONE && payment.status != TradeStatus.TRADE_REFUND) {
                throw new ServiceUnavailableException(`订单支付状态错误`)
            }

            let totalRefund = await PaymentLib.getTotalRefundedByPaymentOrdersn(payment.order_sn)

            this.logger.log(`订单${order.order_sn}已完成退款${totalRefund}`)

            const willRefund = (totalRefund + refundAmount)

            if (willRefund > payment.payment_amount) {
                throw new ServiceUnavailableException(`退款金额超出订单金额`)
            }


            this.logger.debug(`===符合退款条件，开始退款===`)

            reason = (reason || `订单退款`)

            const manager = getManager()

            // 执行退款
            let refundRecord = await manager.save(RefundRecord.create({
                user_id: order.user_id,
                refund_order_sn: `RE${payment.order_order_sn}-${random(6)}`,
                refund_order_goods_ids: [],
                payment_order_sn: payment.order_sn,
                order_order_sn: payment.order_order_sn,
                reason: reason.length > 30 ? reason.slice(0, 30) : reason,
                refund_amount: refundAmount,
                status: RefundRecordStatusDto.REFUNDING
            }))


            // 支付接口退款
            const pay = PaymentProvider.init(payment.trade_way)

            const res = await pay.refund({
                appid: payment.appid,
                refund_amount: refundRecord.refund_amount,
                refund_order_sn: refundRecord.refund_order_sn,
                payment_amount: payment.payment_amount,
                remark: refundRecord.reason,
                order_sn: payment.order_sn,
                third_order_sn: payment.third_order_sn
            })

            this.logger.log(`====退款结果====`, res)

            if (res) {
                refundRecord.status = RefundRecordStatusDto.REFUNDED;
                refundRecord.third_trade_data = res;
                refundRecord.date_success = moment().toDate()
                await manager.save(refundRecord)
            } else {
                refundRecord.status = RefundRecordStatusDto.FAILED;
                refundRecord.third_trade_data = res || null;
                await manager.save(refundRecord)
            }
            return refundRecord
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    /**
     * 支付成功结果验证
     */
    async verify(platform: TradeWay, data: any) {

        const pay = PaymentProvider.init(platform)
        const paydata: WechatNotifyDecrytedData = await pay.verify(data)

        this.logger.log(`=====paydata=====`, paydata)

        const payment = await Payment.findOne({
            where: {
                trade_way: platform,
                order_sn: paydata.out_trade_no
            }
        })

        if (!payment) {
            this.logger.log("======订单不存在=======")
            return PaymentProvider.notifyResponseFailed(`订单不存在`)
        }

        if (payment.status == TradeStatus.TRADE_DONE || payment.status == TradeStatus.TRADE_REFUND || payment.status == TradeStatus.TRADE_PAYDONE) {
            if (payment.status === TradeStatus.TRADE_PAYDONE || payment.status === TradeStatus.TRADE_DONE) {
                this.logger.log("======TRADE_DONE=======")
                await this.orderService.payDone(payment.order_order_sn, payment)
            }
            this.logger.log("======交易成功=======")
            return PaymentProvider.notifyResponseSuccess(platform)
        }

        if (payment.payment_amount != paydata.amount.payer_total) {
            this.logger.log("======支付金额不一致=======")
            return PaymentProvider.notifyResponseFailed(`支付金额不一致`)
        }

        //支付完成
        payment.date_deleted = null;
        payment.date_paydone = paydata.success_time;
        payment.status = TradeStatus.TRADE_PAYDONE;
        payment.third_order_sn = paydata.transaction_id;
        payment.third_trade_data = paydata;
        await Payment.save(payment)


        await this.orderService.payDone(payment.order_order_sn, payment);

        return PaymentProvider.notifyResponseSuccess(platform)
    }

}