/*
 * @Author        : turbo 664120459@qq.com
 * @Date          : 2022-11-24 10:44:10
 * @LastEditors   : turbo 664120459@qq.com
 * @LastEditTime  : 2023-01-08 11:33:48
 * @FilePath      : /nestjs-v8/src/config.ts
 * @Description   : 
 * 
 * Copyright (c) 2022 by turbo 664120459@qq.com, All Rights Reserved. 
 */

import { CacheModuleOptions } from "@nestjs/common"
import { readFileSync } from "fs"
import { join } from "path"


let appPerfixPath = process.env.APP_PRIFIX_PATH || '';
if (appPerfixPath.startsWith("/")) {
    appPerfixPath = appPerfixPath.slice(1)
}

if (appPerfixPath.endsWith("/")) {
    appPerfixPath = appPerfixPath.slice(0, -1)
}
/**
 * @description: app基本配置
 * @return {*}
 */
export const appConfig = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || `http://localhost:${process.env.PORT || 3000}`,
    appGlobalPrefix: appPerfixPath,
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
    db: 'undefined' !== typeof process.env.REDIS_CACHE_DB && /^\d+$/.test(process.env.REDIS_CACHE_DB) ? Number(process.env.REDIS_CACHE_DB) : 1
} as CacheModuleOptions

export const queueConfig = {
    isGlobal: true,
    ttl: 325600,
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    password: process.env.REDIS_PWD || undefined,
    db: 'undefined' !== typeof process.env.REDIS_QUEUE_DB && /^\d+$/.test(process.env.REDIS_QUEUE_DB) ? Number(process.env.REDIS_QUEUE_DB) : 2
}

/**
 * 微信支付
 */
export const wechatPayConfig = {
    /**
     * 商户号
     */
    mchId: process.env.WECHAT_PAY_MCHID,

    /**
     * APIV2 API密钥
     */
    apiv2Secret: process.env.WECHAT_PAY_APIV2_SECRET,

    /**
     * APiV3密钥
     */
    apiv3Secret: process.env.WECHAT_PAY_APIV3_SECRET,

    /**
     * 商户证书序列号
     */
    merchantCertificateSerial: process.env.WECHAT_PAY_MERCHANT_CERT_SERIAL,

    /**
     * 私钥证书
     */
    merchantPrivateKey: process.env.WECHAT_PAY_MERCHANT_PRIVATE_KEY_PATH ? readFileSync(join(__dirname, process.env.WECHAT_PAY_MERCHANT_PRIVATE_KEY_PATH)) : process.env.WECHAT_PAY_MERCHANT_PRIVATE_KEY_VAL,


    /**
     * 平台证书
     */
    platformCertificate: process.env.WECHAT_PAY_PLATFORM_CERT_PATH ? readFileSync(join(__dirname, process.env.WECHAT_PAY_PLATFORM_CERT_PATH)) : process.env.WECHAT_PAY_PLATFORM_CERT_VAL,


    /**
     * 平台证书序列号
     */
    platformCertificateSerial: process.env.WECHAT_PAY_PLATFORM_CERT_SERIAL,

    /**
     * 通知地址
     */
    notiyUri: process.env.WECHAT_PAY_NOTIFY_URL || `${appConfig.host}${appConfig.appGlobalPrefix ? `/${appConfig.appGlobalPrefix}` : ''}/payment/notify/wechat`
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
    userId: process.env.LKSMS_USER_ID,
    appId: process.env.LKSMS_APPID,
    password: process.env.LKSMS_PASSWORD,
    sign: process.env.SIGN
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