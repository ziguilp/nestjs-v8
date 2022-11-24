import { ExpressCom } from "./orderDelivery.dto"

export interface SenderOrReceiverDto {
    name: string,
    tel?: string,
    company: string,
    post_code: string,
    country: string,
    mobile: string,
    province: string,
    city: string,
    area: string,
    address: string
}

export interface WechatQueryItemResDto {
    action_time: number,
    action_type: number,
    action_msg: string
}

export interface LogisticOrderRes {
    logisticCom: ExpressCom,
    waybillCode: string,
    preSortResult: any
}

export interface WechatQueryResDto {
    openid: string,
    delivery_id: string,
    waybill_id: string,
    path_item_num: number,
    path_item_list: WechatQueryItemResDto[]
}

export interface ShopDetailListItem {
    goods_name: string,
    goods_img_url: string,
    goods_desc: string
}

export interface ShopDto {
    wxa_path: string,
    detail_list: ShopDetailListItem[]
}


export interface PackageGoodsDto {
    name: string
    count: number
}

export interface PackageInfoDto {
    count: number,
    weight: number,
    space_x: number,
    space_y: number,
    space_z: number,
    detail_list: PackageGoodsDto[]
}

export interface WechatLogisticWaybillDataDto {
    key: string,
    value: string
}

export interface WechatLogisticResDto {
    order_id?: string,
    waybill_id?: string,
    waybill_data?: WechatLogisticWaybillDataDto[],
    errcode?: string,
    errmsg?: string,
    delivery_resultcode?: string,
    delivery_resultmsg?: string,
}

export interface WechatLogisticUserInfo {
    openid: string
}


/**
 * 物流状态
 */
export enum CustomRouterPathStatus {
    /**
     * 取消
     */
    CANCEL = 'cancel',
    /**
     * 待揽收
     */
    PENDDING = 'waitpick',
    /**
    * 已揽件
    */
    PICKED = 'picked',
    /**
     * 运输中
     */
    TRANSING = 'transing',
    /**
    * 已送达
    */
    SEND = 'send',
    /**
     * 已退回
     */
    BACK = 'back',
}

export interface CustomRouterPathItem {
    time: string,
    context: string,
    ftime: string,
    areaCode: any,
    areaName: any,
    unixtime: number,
    statusMark: CustomRouterPathStatus,
    status: string,
}