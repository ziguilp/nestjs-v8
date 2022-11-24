import { ServiceUnavailableException } from "@nestjs/common";
import { AlipayConfDto } from "../dto/alipay.dto";
import { TradeWay } from "../dto/pay.dto";
import { WechatPayConfigDto } from "../dto/wechat.dto";
import { AliPayLib } from "./ali.pay";
import { WechatPayLib } from "./wechat.pay";

/**
 * 支付聚合
 */
export class PaymentProvider {

    /**
     * 获取支付客户端
     * @param platform 
     * @param config 
     * @returns 
     */
    static init(platform: TradeWay, config?: WechatPayConfigDto | AlipayConfDto): AliPayLib | WechatPayLib {

        if (platform == TradeWay.WECHAT_PAY) {
            return new WechatPayLib(config as WechatPayConfigDto);
        }

        if (platform == TradeWay.ALI_PAY) {
            return new AliPayLib(config as AlipayConfDto);
        }

        throw new ServiceUnavailableException(`Undefined Payment Provider:${platform}`)
    }

    static notifyResponseSuccess(platform: TradeWay) {
        if (platform == TradeWay.WECHAT_PAY)
            return {
                code: "SUCCESS",
                message: "成功"
            }
        return 'SUCCESS';
    }

    static notifyResponseFailed(message: string) {
        throw new ServiceUnavailableException(message);
    }
}