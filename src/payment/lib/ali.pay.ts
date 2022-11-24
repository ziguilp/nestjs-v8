/*
 * @Author        : turbo 664120459@qq.com
 * @Date          : 2022-11-24 10:44:10
 * @LastEditors   : turbo 664120459@qq.com
 * @LastEditTime  : 2022-11-24 14:22:09
 * @FilePath      : /nestjs-v8/src/payment/lib/ali.pay.ts
 * @Description   : 支付宝实现
 * 
 * Copyright (c) 2022 by turbo 664120459@qq.com, All Rights Reserved. 
 */
import { PaymentImplements } from "./payment.implements";

import AlipaySdk from 'alipay-sdk';
import { readFileSync } from "fs";
import { aliPayConfig } from "src/config";
import { AlipayConfDto } from "../dto/alipay.dto";
import { PaymentOrderDto, ThirdRefundResultDto, TradeClient, TradeStatus, WechatPayOrderDto } from "../dto/pay.dto";

/**
 * 支付宝实现
 * 
 */
export class AliPayLib extends PaymentImplements {
    /**
    * 配置
    */
    private conf: AlipayConfDto;

    instance: AlipaySdk;

    constructor(options?: AlipayConfDto) {
        super();
        const conf = Object.assign(aliPayConfig, options || {});
        this.conf = conf;

        this.instance = new AlipaySdk({
            // 参考下方 SDK 配置
            appId: conf.appId,
            privateKey: readFileSync(conf.privateKey, 'ascii'),
            alipayRootCertPath: conf.alipayRootCertPath,
            alipayPublicCertPath: conf.alipayPublicCertPath,
            appCertPath: conf.appCertPath,
        });

    }

    /**
     * @description: 创建支付订单-发起支付
     * @param {*} payorder
     * @return {*}
     */
    async createPay(payorder, tradeClientSet: TradeClient = TradeClient.native, extra?: Record<string, any>) {

        return null;
    }

    async closePay(payorder): Promise<boolean> {

        console.log(`支付关闭`)
        return true;
    }

    async refund(refund): Promise<ThirdRefundResultDto> {

        console.log(`res`)
        return
    }

    async query(payorder): Promise<PaymentOrderDto> {


        return {
            order_sn: '',
            third_order_sn: '',
            trade_status: TradeStatus.TRADE_CANCEL,
        } as PaymentOrderDto
    }

    async verify(data: any): Promise<any> {
        return null
    }
}