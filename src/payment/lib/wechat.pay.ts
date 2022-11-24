import { Wechatpay, Formatter, Rsa, Aes } from 'wechatpay-axios-plugin';
import { ServiceUnavailableException } from '@nestjs/common';
import { wechatPayConfig } from 'src/config';
import { PaymentImplements } from './payment.implements';
import { WechatNotifyDataDto, WechatNotifyDecrytedData, WechatPayConfigDto } from '../dto/wechat.dto';
import { PaymentOrderDto, RefundPayorderDto, ThirdRefundResultDto, TradeClient, TradeStatus, WechatPayOrderDto } from '../dto/pay.dto';

/**
 * 微信支付实现
 */
export class WechatPayLib extends PaymentImplements {

    /**
     * 配置
     */
    private conf: WechatPayConfigDto;

    instance: Wechatpay;

    constructor(options?: WechatPayConfigDto) {
        super();
        const conf = Object.assign(wechatPayConfig, options || {}) as WechatPayConfigDto;
        this.conf = conf;

        this.instance = new Wechatpay({
            mchid: conf.mchId,
            serial: conf.merchantCertificateSerial,
            privateKey: conf.merchantPrivateKey,
            certs: { [conf.platformCertificateSerial]: conf.platformCertificate, },
            // 使用APIv2时，需要至少设置 `secret`字段，示例代码未开启
            // APIv2密钥(32字节)
            secret: conf.apiv2Secret,
        });

    }

    async createPay(payorder: WechatPayOrderDto, tradeClientSet: TradeClient = TradeClient.native, extra?: any) {

        const paymentParam = {
            mchid: this.conf.mchId,
            out_trade_no: payorder.order_sn,
            appid: payorder.appid,
            description: payorder.desc.length > 70 ? payorder.desc.substring(0, 70) : payorder.desc,
            notify_url: this.conf.notiyUri,
            amount: {
                total: payorder.payment_amount,
                currency: 'CNY'
            },
        }

        if ([TradeClient.h5].indexOf(tradeClientSet) > 0) {
            paymentParam['scene_info'] = {
                payer_client_ip: extra?.clientIp,
                store_info: extra?.store_info,
                h5_info: extra?.h5_info
            }
        }

        if ([TradeClient.JSAPI, TradeClient.app].indexOf(tradeClientSet) >= 0) {
            if (!payorder.openid)
                throw new ServiceUnavailableException(`必须包含参数openid`)
            paymentParam['payer'] = {
                openid: payorder.openid
            }
        }

        console.log(`======支付请求=====`, paymentParam)

        const wxpay = await this.instance.v3.pay.transactions[tradeClientSet]
            .post(paymentParam).catch(error => {
                this.parseException(error)
            })

        const result = this.parseResult(wxpay);

        if (result.hasOwnProperty('prepay_id')) {
            const params = {
                appId: payorder.appid,
                timeStamp: `${Formatter.timestamp()}`,
                nonceStr: Formatter.nonce(),
                package: `prepay_id=${result.prepay_id}`,
                signType: 'RSA',
                paySign: ''
            }
            params.paySign = Rsa.sign(Formatter.joinedByLineFeed(
                params.appId, params.timeStamp, params.nonceStr, params.package
            ), this.conf.merchantPrivateKey)

            return params;
        }

        return result;
    }

    async closePay(payorder: PaymentOrderDto): Promise<boolean> {
        const res = await this.instance.v3.pay.transactions.outTradeNo[payorder.order_sn].close
            .post({ mchid: this.conf.mchId })
            .catch(error => {
                this.parseException(error)
            })
        console.log(`支付关闭`, res)
        return true;
    }

    async refund(refund: RefundPayorderDto): Promise<ThirdRefundResultDto> {
        const refundParam = {
            // appid: refund.appid,
            // mch_id: this.conf.mchId,
            out_trade_no: refund.order_sn,
            out_refund_no: refund.refund_order_sn,
            amount: {
                refund: refund.refund_amount,
                total: refund.payment_amount,
                currency: 'CNY'
            },
            reason: refund.remark,
        };
        console.log(`====微信退款发起====`, refundParam)
        const res = await this.instance.v3.refund.domestic.refunds.post(refundParam)
            .catch(error => {
                this.parseException(error)
            })
        console.log(`====微信退款结果====`, res)
        const refundRes = this.parseResult(res)
        return {
            originalData: refundRes,
            out_refund_no: refundRes.out_refund_no,
            out_trade_no: refundRes.out_trade_no,
            third_refund_no: refundRes.refund_id,
            status: refundRes.status,
            third_payment_no: refundRes.transaction_id,
        } as ThirdRefundResultDto
    }

    async query(payorder: PaymentOrderDto): Promise<PaymentOrderDto> {
        const res = await this.instance.v3.pay.transactions.id['{transaction_id}']
            .get({
                params: {
                    mchid: this.conf.mchId,
                    transaction_id: payorder.third_order_sn
                },
            })
            .catch(error => {
                this.parseException(error)
            })

        console.log(`res`, res)

        return {
            order_sn: '',
            third_order_sn: '',
            trade_status: TradeStatus.TRADE_CANCEL,
        } as PaymentOrderDto
    }

    private parseException(error) {
        console.error(error);
        try {
            let { response: { status, statusText, data } } = error;
            console.log(error.response)
            if (data) {
                const jsonData = typeof data == 'object' ? data : JSON.parse(data);
                console.log(jsonData, jsonData.code)
                throw new ServiceUnavailableException(jsonData.message)
            } else {
                throw new ServiceUnavailableException(error.message)
            }
        } catch (err) {
            throw err
        }
    }

    private parseResult(result) {
        try {
            const { data } = result;
            console.log(data)
            return typeof data == 'object' ? data : JSON.parse(data)
        } catch (error) {
            console.error(error)
        }
        return null;
    }


    async verify(data: WechatNotifyDataDto): Promise<WechatNotifyDecrytedData> {
        let paydata: any = await Aes.AesGcm.decrypt(data.resource.nonce, this.conf.apiv3Secret, data.resource.ciphertext, data.resource.associated_data);
        console.log(`解密微信支付数据为`, paydata)
        paydata = typeof paydata == 'object' ? paydata : JSON.parse(paydata);
        if (!paydata) {
            throw new ServiceUnavailableException("支付回调解密数据无效");
        }
        return paydata as WechatNotifyDecrytedData
    }



}