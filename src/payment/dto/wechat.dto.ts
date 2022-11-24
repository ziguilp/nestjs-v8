import { SceneInfoDto } from "./pay.dto";

/**
 * 微信支付配置
 */
export class WechatPayConfigDto {
    /**
     * 商户号
     */
    mchId: string;

    /**
     * APIV2 API密钥
     */
    apiv2Secret: string;

    /**
     * APIV3密钥
     */
    apiv3Secret: string;

    /**
     * 商户证书序列号
     */
    merchantCertificateSerial: string;

    /**
     * 私钥证书内容
     */
    merchantPrivateKey: Buffer;


    /**
     * 平台证书
     */
    platformCertificate: Buffer;


    /**
     * 平台证书序列号
     */
    platformCertificateSerial: string


    /**
     * 异步通知接口地址
     */
    notiyUri: string
}

/**
 * 回调数据内容
 */
export class WechatNotifyDataResourceDto {
    original_type: string;
    algorithm: string;
    ciphertext: string;
    associated_data: string;
    nonce: string;
}

/**
 * 回调通知数据
 */
export class WechatNotifyDataDto {
    /**
     * 通知id
     */
    id: string;

    /**
     * 通知时间
     */
    create_time: Date;

    /**
     * resource_type
     */
    resource_type: string;
    event_type: string;
    summary: string;
    resource: WechatNotifyDataResourceDto;
}

/**
 * 回调解密数据
 */
export class WechatNotifyDecrytedData {
    /**
     * 微信交易单号
     */
    transaction_id: string
    appid: string
    mchid: string
    out_trade_no: string
    trade_type: string
    trade_state: string
    trade_state_desc: string
    bank_type: string
    attach?: string
    success_time: Date
    payer?: null | {
        openid: string
    }
    amount: {
        total: number
        payer_total: number
        currency: string
        payer_currency: string
    }
    scene_info?: SceneInfoDto
    promotion_detail?: null | {

    }
}