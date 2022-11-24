/*
 * @Author        : turbo 664120459@qq.com
 * @Date          : 2022-11-24 10:44:10
 * @LastEditors   : turbo 664120459@qq.com
 * @LastEditTime  : 2022-11-24 14:18:25
 * @FilePath      : /nestjs-v8/src/config.ts
 * @Description   : 
 * 
 * Copyright (c) 2022 by turbo 664120459@qq.com, All Rights Reserved. 
 */

import { CacheModuleOptions } from "@nestjs/common"
import { readFileSync } from "fs"
import { join } from "path"


/**
 * @description: app基本配置
 * @return {*}
 */
export const appConfig = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || `http://localhost:${process.env.PORT || 3000}`,
    appNameSpace: process.env.PROJECT_NAME || 'my-nest-app',
}


/**
 * 快递100配置
 */
export const prinerConfig = {
    KD100_API: process.env.KD100_API || `https://poll.kuaidi100.com/printapi/printtask.do`,
    KD100_CALL_BACK_URL: process.env.KD100_CALL_BACK_URL || ``,
    KD100_KEY: process.env.KD100_KEY || `zHyJQnNJ3257`,
    KD100_SECRET: process.env.KD100_SECRET || `7c564cc8342a49798853784111ec3670`,
}

export const cacheConfig = {
    isGlobal: true,
    ttl: 60, // 默认缓存60秒
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    password: process.env.REDIS_PWD || undefined,
    db: 1
} as CacheModuleOptions

export const queueConfig = {
    isGlobal: true,
    ttl: 325600,
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    password: process.env.REDIS_PWD || undefined,
    db: 2
}

/**
 * 微信支付
 */
export const wechatPayConfig = {
    /**
     * 商户号
     */
    mchId: '1628577543',

    /**
     * APIV2 API密钥
     */
    apiv2Secret: 'e8838a30932bdafcbe88a1295face287',

    /**
     * APiV3密钥
     */
    apiv3Secret: '4250ac12e3c589b36ab652790690e6be',

    /**
     * 商户证书序列号
     */
    merchantCertificateSerial: '72793711DEB72A93670264D4CA11B2EFC74BA8D9',

    /**
     * 私钥证书
     */
    merchantPrivateKey: readFileSync(join(__dirname, './payment/cert/wechat/apiclient_key.pem')),

    /**
     * 平台证书
     */
    platformCertificate: readFileSync(join(__dirname, './payment/cert/wechat/wechatpay_1124B6D4EBAEAB430A4030FB3D5364D2370F5DE3.pem')),

    /**
     * 平台证书序列号
     */
    platformCertificateSerial: '',

    /**
     * 通知地址
     */
    notiyUri: appConfig.host + '/payment/notify/wechat'
}

/**
 * 支付宝
 */
export const aliPayConfig = {
    /**
     * APPID
     */
    appId: '2016123456789012',
    /**
     * 私钥
     */
    privateKey: join(__dirname, './payment/cert/alipay/root.crt'),
    /**
     * 支付宝根证书
     */
    alipayRootCertPath: join(__dirname, './payment/cert/alipay/root.crt'),
    /**
     * 支付宝公钥
     */
    alipayPublicCertPath: join(__dirname, './payment/cert/alipay/aly.cert.pem'),
    /**
     * 应用证书
     */
    appCertPath: join(__dirname, './payment/cert/alipay/app.cert.crt'),
}


/**
 * 微信物流助手
 */
export const WechatLogisticServiceType = {
    ZTO: {
        value: 0,
        name: '标准快件',
        customId: ''
    },
    YUNDA: {
        value: 0,
        name: '标准快件',
        customId: ''
    },
    SF: {
        value: 0,
        name: '标准快递',
        customId: ''
    },
    JDL: {
        value: 0,
        name: '特惠送',
        customId: ''
    },
    DB: {
        value: 2,
        name: '特准快件',
        customId: ''
    }
}

/**
 * 短信发送
 */
export const LkSMSConfig = {
    userId: '',
    appId: '',
    password: ``,
    sign: 'NestV8'
}

/**
 * 极光推送
 */
export const JpushConfig = {
    appKey: '',
    appSecret: ''
}

/**
 * 模板
 */
export const WechatTemplates = {
    '0kITFz3XiodC2v3GbHdehX2kI-fWmiu36wlgnW7xpTM': {
        fields: ['trackNo'],
    }
}