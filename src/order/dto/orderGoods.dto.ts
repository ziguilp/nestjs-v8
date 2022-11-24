/**
 * 商品类型
 */
export enum OrderGoodsType {
    /**
     * 会员卡订阅
     */
    VIP_ORDER,
    /**
     * 商品
     */
    GOODS,
}

export enum OrderGoodsStatus {
    /**
      * 已作废
      */
    CANCEL,

    /**
     * 待支付
     */
    BEFORE_PAY,

    /**
     * 已支付
     */
    PAYDONE,

    /**
     * 部分已退款
     */
    REFUND_PARTLY,

    /**
     * 全部已退款
     */
    REFUND_ALL,
}


export enum OrderGoodsSettleStatus {
    /**
     * 待结算
     */
    UNSETTLE,
    /**
    * 结算中
    */
    SETTLEING,
    /**
    * 结算完成
    */
    SETTLEDONE,
}


/**
 * CreateOrderGoodsItem
 */
export interface CreateOrderGoodsItem {
    goodsType: OrderGoodsType,
    goodsId: number,
    goodsNum: number
}