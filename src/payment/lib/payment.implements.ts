import { PaymentOrderDto, PayOrderDto, RefundPayorderDto, ThirdRefundResultDto, TradeClient, WechatPayOrderDto } from "../dto/pay.dto";
import { WechatNotifyDecrytedData } from "../dto/wechat.dto";


/**
 * 聚合支付实现
 */
export abstract class PaymentImplements {

    /**
     * 实列
     */
    instance: any;

    /**
     * 支付发起
     */
    abstract createPay(payorder: PayOrderDto | WechatPayOrderDto, tradeClient: TradeClient, extra?: any);


    /**
     * 未支付订单关闭
     */
    abstract closePay(payorder: PaymentOrderDto): Promise<boolean>;


    /**
     * 订单退款
     */
    abstract refund(refund: RefundPayorderDto): Promise<ThirdRefundResultDto>;


    /**
     * 订单查询
     */
    abstract query(payorder: PaymentOrderDto): Promise<PaymentOrderDto>;

    /**
     * 回调验证
     */
    abstract verify(data: any): Promise<WechatNotifyDecrytedData>;
}