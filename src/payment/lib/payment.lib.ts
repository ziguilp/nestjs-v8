import { In } from "typeorm";
import { RefundRecordStatusDto } from "../dto/refund.dto";
import { RefundRecord } from "../entity/refundRecord.entity";

export class PaymentLib {
    /**
     * 获取订单总的退款金额
     * @param orderSn 
     */
    static async getTotalRefundedByPaymentOrdersn(orderSn: string) {
        let { totalRefund } = await RefundRecord.createQueryBuilder()
            .select('SUM(refund_amount)', 'totalRefund')
            .where({
                payment_order_sn: orderSn,
                status: In([RefundRecordStatusDto.REFUNDED, RefundRecordStatusDto.REFUNDING])
            }).getRawOne();

        return parseInt(totalRefund)
    }

    /**
    * 获取订单总的退款金额
    * @param orderSn 
    */
    static async getTotalRefundedByOrderOrdersn(orderSn: string) {
        let { totalRefund } = await RefundRecord.createQueryBuilder()
            .select('SUM(refund_amount)', 'totalRefund')
            .where({
                order_order_sn: orderSn,
                status: In([RefundRecordStatusDto.REFUNDED, RefundRecordStatusDto.REFUNDING])
            }).getRawOne();

        return parseInt(totalRefund)
    }
}