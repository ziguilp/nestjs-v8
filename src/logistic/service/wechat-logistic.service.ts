import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as moment from 'moment';
import { appConfig, WechatLogisticServiceType } from 'src/config';
import { ExpressCom, OrderDeliveryStatus } from '../dto/orderDelivery.dto';
import { CustomRouterPathItem, LogisticOrderRes, PackageInfoDto, SenderOrReceiverDto, ShopDto, WechatLogisticResDto, WechatLogisticUserInfo, WechatQueryResDto } from '../dto/wechatLogistic.dto';
import { ThirdLoginService } from '../../auth/third/login.service'
import { Cache } from 'cache-manager';
import { WechatLib } from 'src/auth/third/wechat.lib';

const WechatStatusConf = {
    /**揽件成功 */
    '100001': {
        val: OrderDeliveryStatus.TRANSING,
        text: '揽件成功',
    },
    /**揽件失败 */
    "100002": {
        val: OrderDeliveryStatus.PACKING,
        text: '揽件失败'
    },
    /**分配业务员 */
    "100003": {
        val: OrderDeliveryStatus.PACKING,
        text: '待揽收'
    },
    /**运输中 */
    "200001": {
        val: OrderDeliveryStatus.TRANSING,
        text: '在途'
    },
    /**开始配送 */
    "300002": {
        val: OrderDeliveryStatus.TRANSING,
        text: '派件'
    },
    /**签收 */
    "300003": {
        val: OrderDeliveryStatus.RECEIVED,
        text: '签收'
    },
    /**签收失败 */
    "300004": {
        val: OrderDeliveryStatus.EXCEPTION,
        text: '签收失败'
    },
    /**取消 */
    "400001": {
        val: OrderDeliveryStatus.ABANDON,
        text: '取消'
    },
    /**滞留 */
    "400002": {
        val: OrderDeliveryStatus.TRANSING,
        text: '滞留'
    }
}

@Injectable()
export class WechatLogisticService {

    private readonly logger = new Logger(WechatLogisticService.name);

    private API_URL = `https://api.weixin.qq.com/cgi-bin/express/business`

    private API_METHOD = ``

    private body: any = {}

    private wechatLib: WechatLib;

    constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {
        this.wechatLib = new WechatLib(this.cache)
    }

    /**
    * 物流下单
    */
    async submitOrderCustom(businessOrderId, sender: SenderOrReceiverDto, receive: SenderOrReceiverDto, shopInfo: ShopDto, packageInfo: PackageInfoDto, delivery_id: ExpressCom, user: WechatLogisticUserInfo, expect_time: Date | null = null, custom_remark = '') {
        this.logger.debug(`========物流下单=======`)
        // 参数处理
        shopInfo.detail_list = shopInfo.detail_list.map(e => {
            e.goods_name = e.goods_name.substring(0, 10)
            return e
        })
        packageInfo.detail_list = packageInfo.detail_list.map(e => {
            e.name = e.name.substring(0, 10)
            return e
        })

        this.body = {
            add_source: 0,
            wx_appid: process.env.WECHAT_MINIAPPID,
            order_id: businessOrderId,
            delivery_id,
            biz_id: WechatLogisticServiceType[delivery_id].customId,
            custom_remark,
            sender: sender,
            receiver: receive,
            cargo: {
                count: packageInfo.count || 1,
                weight: packageInfo.weight || 1,
                space_x: packageInfo.space_x || 20,
                space_y: packageInfo.space_y || 15,
                space_z: packageInfo.space_z || 5,
                detail_list: (packageInfo.detail_list || []).map(e => {
                    if (e.name.length > 40) {
                        e.name = e.name.substring(0, 40)
                    }
                    return e
                })
            },
            shop: shopInfo,
            insured: {
                use_insured: 0,
                insured_value: 0
            },
            service: {
                service_type: WechatLogisticServiceType[delivery_id].value,
                service_name: WechatLogisticServiceType[delivery_id].name
            }
        }

        if (user && user.openid) {
            this.body.openid = user.openid
        } else {
            this.body.add_source = 2
        }

        if (expect_time) {
            this.body.expect_time = moment(expect_time).unix()
        }

        this.API_METHOD = `/order/add`
        const wlres: WechatLogisticResDto = await this.exec();

        return {
            logisticCom: delivery_id,
            waybillCode: wlres.waybill_id,
            preSortResult: (wlres.waybill_data || []).reduce((p, c) => {
                p[c.key] = c.value
                return p
            }, { order_id: businessOrderId })
        } as LogisticOrderRes
    }

    /**
     * 物流取消
     * @returns 
     */
    async cancel(order_id: string, trackingNo: string, delivery_id: ExpressCom, user?: WechatLogisticUserInfo, reason: string = '订单取消') {

        this.logger.debug(`===取消物流单==`, trackingNo)

        this.API_METHOD = '/order/cancel'
        this.body = {
            order_id,
            delivery_id,
            waybill_id: trackingNo
        }

        if (user && user.openid) {
            this.body.openid = user.openid
        }

        await this.exec()

        return true
    }


    /**
     * 运单轨迹查询
     * @returns 
     */
    async query(od_id: string, trackingNo: string, delivery_id: ExpressCom) {

        this.API_METHOD = `/path/get`

        this.body = {
            order_id: od_id,
            delivery_id: delivery_id,
            waybill_id: trackingNo
        }

        const res: WechatQueryResDto = await this.exec()

        let latest_opetime = 0, latest_odn_status = null;

        const list = (res.path_item_list || []).map(e => {

            const cf = WechatStatusConf[e.action_type];

            if (e.action_time > latest_opetime) {
                latest_opetime = e.action_time;
                latest_odn_status = cf.val
            }

            const cu: CustomRouterPathItem = {
                time: moment(e.action_time * 1000).utcOffset('+08:00').format("YYYY-MM-DD HH:mm:ss"),
                ftime: moment(e.action_time * 1000).utcOffset('+08:00').format("YYYY-MM-DD HH:mm:ss"),
                unixtime: e.action_time,
                context: e.action_msg,
                areaCode: null,
                areaName: null,
                statusMark: cf.val,
                status: cf.text
            }
            return cu
        });

        return {
            tracking_detail: JSON.stringify(list),
            latest_odn_status: latest_odn_status,
            latest_opetime: moment(latest_opetime * 1000).utcOffset('+08:00').format("YYYY-MM-DD HH:mm:ss+08")
        }
    }


    async exec() {
        try {
            let client = await this.wechatLib.getWechatMiniAppClient()
            this.logger.debug(`===微信物流助手请求参数===`, this.API_METHOD, this.body)

            const access_token = await client.getAccessToken(false)
            this.logger.debug(access_token, this.body)
            let res = await axios({
                url: `${this.API_URL}${this.API_METHOD}?access_token=${access_token}`,
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                data: this.body
            })
            this.logger.debug(res.data)
            if (res.data.errmsg && res.data.errmsg.indexOf('access_token is invalid') > -1) {
                const access_token = await client.getAccessToken(true)
                this.logger.debug(access_token, this.body)
                res = await axios({
                    url: `${this.API_URL}${this.API_METHOD}?access_token=${access_token}`,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    data: this.body
                })
                this.logger.debug(res.data)
            }
            if (Object.prototype.hasOwnProperty.call(res.data, 'errcode') && res.data.errcode != 0) {
                throw new Error(res.data.delivery_resultmsg || res.data.errmsg)
            }
            return res.data
        } catch (e) {
            throw e
        }
    }
}
