
/**
 * 余额变更类型
 */
export enum DepositAmountLogTypeDto {
    /**
     * 押金缴纳
     */
    PLUS,
    /**
     * 押金退回
     */
    MINUS,
    /**
     * 扣除[消费]
     */
    CONSUME
}

/**
 * 会员期变更类型
 */
export enum VipSubscribeLogType {
    /**
     * 购买会员
     */
    PURCHASE_CARD,
    /**
    * 兑换
    */
    EXCHANGE,
    /**
    * 系统奖励
    */
    SYSTEM,
    /**
    * 会员卡取消
    */
    DISTORY,
}