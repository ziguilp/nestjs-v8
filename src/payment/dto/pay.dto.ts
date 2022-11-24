import { ApiProperty } from "@nestjs/swagger";


/**
 * 创建支付参数
 */
export class PayOrderDto {

    /**
     * 订单号
     */
    @ApiProperty({
        name: 'order_sn',
        description: '订单号'
    })
    order_sn: string;

    /**
     * 交易金额分
     */
    @ApiProperty({
        name: 'payment_amount',
        description: '交易金额分'
    })
    payment_amount: number;


    /**
    * 交易描述
    */

    @ApiProperty({
        name: 'desc',
        description: '交易描述'
    })
    desc: string;

    /**
     * 交易备注
     */
    @ApiProperty({
        name: 'remark',
        description: '交易备注'
    })
    remark: string;
}


/**
 * 门店信息
 */
export class StoreInfoDto {
    @ApiProperty({
        name: 'id',
        description: '商户侧门店编号'
    })
    id: string;

    @ApiProperty({
        default: '',
        name: 'name',
        description: '商户侧门店名称'
    })
    name: string;

    @ApiProperty({
        default: '',
        name: 'area_code',
        description: '地区编码'
    })
    area_code: string;


    @ApiProperty({
        default: '',
        name: 'address',
        description: '商户侧门店详细地址'
    })
    address: string;
}


/**
 * 支付场景
 */
export class SceneInfoDto {
    @ApiProperty({
        name: 'payer_client_ip',
        description: '用户的客户端IP，支持IPv4和IPv6两种格式的IP地址'
    })
    payer_client_ip: string;

    @ApiProperty({
        default: '',
        name: 'device_id',
        description: '商户端设备号（门店号或收银设备ID）'
    })
    device_id: string;


    @ApiProperty({
        default: '',
        name: 'store_info',
        description: '门店信息'
    })
    store_info: StoreInfoDto;
}

/**
 * 微信支付发起
 */
export class WechatPayOrderDto extends PayOrderDto {
    /**
     * appid
     */
    @ApiProperty({
        name: 'appid',
        description: 'APPID'
    })
    appid: string;

    @ApiProperty({
        name: 'openid',
        description: 'openid'
    })
    openid: string;

    @ApiProperty({
        name: 'scene_info',
        description: '场景信息'
    })
    scene_info?: SceneInfoDto
}

/**
 * 交易方式
 */
export enum TradeWay {
    /**
     * 微信支付
     */
    WECHAT_PAY = 'wechat',

    /**
     * 支付宝支付
     */
    ALI_PAY = 'alipay',

    /**
    * apple支付
    */
    APPLE_PAY = 'apple',

    /**
    * 现金支付
    */
    CASH_PAY = 'cash',
}


/**
 * 交易客户端
 */
export enum TradeClient {
    /**
     * JASPI[微信使用]
     */
    JSAPI = 'jsapi',

    /**
     * app
     */
    app = 'app',

    /**
     * h5[微信、支付宝]
     */
    h5 = 'h5',


    /**
    * native[微信]
    */
    native = 'native',

}

/**
 * 交易状态
 */
export enum TradeStatus {

    /**
     * 交易未支付关闭
     */
    TRADE_CLOSED,

    /**
    * 交易取消
    */
    TRADE_CANCEL,

    /**
     * 交易支付中
     */
    TRADE_PAYING,

    /**
    * 交易支付完成
    */
    TRADE_PAYDONE,

    /**
     * 交易有退款
     */
    TRADE_REFUND,

    /**
     * 交易完成[支付完超过一定时间]
     */
    TRADE_DONE,
}

/**
 * 订单数据
 */
export class PaymentOrderDto {
    /**
     * 本系统订单号
     */
    order_sn: string;

    /**
     * 第三方订单号
     */
    third_order_sn: string;

    /**
     * 交易状态
     */
    trade_status?: TradeStatus;


    /**
     * 交易备注
     */
    remark: string;
}


/**
 * 订单退款
 */
export class RefundPayorderDto extends PaymentOrderDto {

    /**
     * appid
     */
    appid: string;


    /**
     * 本系统退款订单号
     */
    refund_order_sn: string;

    /**
     * 原交易金额分
     */
    payment_amount: number;



    /**
     * 退款金额分
     */
    refund_amount: number;
}


/**
 * 退款成功的数据
 */
export class ThirdRefundResultDto {
    /**
     * 元数据
     */
    originalData: any

    /**
     * 本地的退款单号
     */
    out_refund_no: string

    /**
     * 本地的交易单号
     */
    out_trade_no: string

    /**
     * 三方系统的退款单号
     */
    third_refund_no: string

    /**
     * 三方系统的退款描述
     */
    status: string

    /**
     * 三方系统的付款单号
     */
    third_payment_no: string
}