/**
 * 第三方平台
 */
export enum ThirdPlatformDto {
    /**
     * 微信公众号
     */
    WECHAT_MP = 'wechat_mp',

    /**
     * 微信小程序
     */
    WECHAT_MINIAPP = 'wechat_miniapp',

    /**
    * 微信开放平台APP
    */
    WECHAT_OPENAPP = 'wechat_openapp',
}


export enum Gender {
    /**
     * 女性
     */
    FEMALE = 0,
    /**
     * 男性
     */
    MALE = 1,
    /**
     * 未知
     */
    UNKNOWN = 2
}

export interface ThirdLoginResultDto {
    platform: ThirdPlatformDto,
    openid: string,
    unionid?: string,
    nickname: string,
    avatar?: string,
    gender?: Gender
}