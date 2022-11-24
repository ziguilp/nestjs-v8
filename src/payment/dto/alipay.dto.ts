/*
 * @Author        : turbo 664120459@qq.com
 * @Date          : 2022-11-24 10:44:10
 * @LastEditors   : turbo 664120459@qq.com
 * @LastEditTime  : 2022-11-24 14:23:58
 * @FilePath      : /nestjs-v8/src/payment/dto/alipay.dto.ts
 * @Description   : 支付宝支付配置
 * 
 * Copyright (c) 2022 by turbo 664120459@qq.com, All Rights Reserved. 
 */
export class AlipayConfDto {
    /**
     * APPID
     */
    appId: string
    /**
     * 私钥路径
     */
    privateKey: string
    /**
     * 支付宝根证书路径
     */
    alipayRootCertPath: string
    /**
     * 支付宝公钥路径
     */
    alipayPublicCertPath: string
    /**
     * 应用证书路径
     */
    appCertPath: string
}