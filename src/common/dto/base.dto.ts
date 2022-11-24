import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsNotEmpty, IsNumberString, IsOptional, Length, Min } from "class-validator";

export class ResultData {
    constructor(code = 200, msg?: string, data?: any) {
        this.statusCode = code
        this.message = msg || 'ok'
        this.data = data || null
    }

    @ApiProperty({ type: 'number', default: 200 })
    statusCode: number

    @ApiProperty({ type: 'string', default: 'ok' })
    message?: string

    @ApiProperty({ type: 'string', default: '' })
    error?: string

    data?: any

    static ok(data?: any, msg?: string): ResultData {
        return new ResultData(200, msg, data)
    }

    static fail(code: number, msg?: string, data?: any): ResultData {
        return new ResultData(code || 500, msg || 'fail', data)
    }
}

/**
 * 列表请求参数类
 */
export class IPageDto<T> {

    /**
     * 页数
     */
    @ApiProperty({
        description: '页数,默认1',
        default: 1,
        name: 'page'
    })
    @IsOptional()
    @IsNumberString()
    page: number;


    /**
     * 每页多少
     */
    @ApiProperty({
        description: '页宽',
        default: 10,
        name: 'pageSize'
    })
    @IsOptional()
    @IsNumberString()
    pageSize: number;


    /**
     * 排序字段
     */
    @ApiProperty({
        description: '排序字段',
        default: null,
        name: 'sortBy'
    })
    sortBy?: { [key: string]: 'ASC' | 'DESC' };

    /**
    * 排序
    */
    @ApiProperty({
        description: '排序字段',
        default: null,
        name: 'sortBy'
    })
    data?: T;
}



/**
 * 分页数据结构
 */
export class IPageResDto<T> {

    /**
     * 当前页数
     */
    @ApiProperty({
        description: '当前页数',
        default: 1,
        name: 'page'
    })
    currentPage: number;


    /**
     * 每页多少
     */
    @ApiProperty({
        description: '页宽',
        default: 10,
        name: 'pageSize'
    })
    pageSize: number;


    /**
     * 排序字段
     */
    @ApiProperty({
        description: '排序字段',
        default: null,
        name: 'sortBy'
    })
    sortBy?: Object;

    /**
     * 总数量
     */
    @ApiProperty({
        description: '总数量',
        default: 0,
        name: 'total'
    })
    total: number;

    /**
     * 数据
     */
    @ApiProperty({
        description: '数据',
        default: [],
        name: 'sortBy'
    })
    list: Array<T>;

}

/**
 * 验证码事件
 */
export enum CaptchaVerifyEventType {
    /**
     * 测试
     */
    TEST = 'test',
    /**
    * 登录
    */
    LOGIN = 'login',
    /**
     * 账户注册
     */
    REGISTER = 'register',
    /**
     * 修改密码
     */
    MODIFY_PASSWORD = 'modify_password',
    /**
     * 重置密码
     */
    RESET_PASSWORD = 'reset_password',
}


/**
 * 通知
 */
export class NotifyDto {

    systemMsgId?: number;

    @ApiProperty({
        name: 'title',
        default: '',
        description: '通知标题'
    })
    title: string

    @ApiProperty({
        name: 'receiver',
        default: '',
        description: '接收人(手机号/邮箱)'
    })
    receiver: [string]

    @ApiProperty({
        name: 'content',
        default: '',
        description: '通知内容'
    })
    content: string

}

/**
 * 内部通知
 */
export class NotifyInnerDto {

    @ApiProperty({
        name: 'title',
        default: '',
        description: '通知标题'
    })
    title: string

    @ApiProperty({
        name: 'receiver',
        default: '',
        description: '接收人[用户ID]'
    })
    receiver: [string]

    @ApiProperty({
        name: 'content',
        default: '',
        description: '通知内容'
    })
    content: string
}

/**
 * 验证码dto
 */
export class CaptchaSendDto {
    @ApiProperty({
        name: 'username',
        default: '',
        description: '手机号或者邮箱地址'
    })
    @IsNotEmpty()
    username: string

    @ApiProperty({
        name: 'event',
        default: '',
        description: '验证码事件'
    })
    @IsNotEmpty()
    @IsIn(Object.values(CaptchaVerifyEventType))
    event: CaptchaVerifyEventType
}

/**
 * 验证码验证
 */
export class CaptchaVerifyDto extends CaptchaSendDto {

    @ApiProperty({
        name: 'captcha',
        default: '',
        description: '验证码'
    })
    @IsNotEmpty()
    @Length(4, 8)
    captcha: string

}

/**
 * 接口验证码验证提交📚
 */
export class CaptchaVerifyBodyDto {
    @ApiProperty({
        name: "captchaVerifyData"
    })
    captchaVerifyData: CaptchaVerifyDto
}

/**
 * 系统通知通道
 */
export enum NotifyPipe {
    /**
     * 仅仅是内部系统消息
     */
    SYSTEM = 'system',
    /**
     * 邮件
     */
    EMAIL = 'email',
    /**
     * 短信
     */
    SMS = 'sms',
    /**
     * 微信模板消息[公众号模板消息]
     */
    WECHAT_MP_TEMPLATE = 'wechat_mp_tempmsg',
    /**
     * 微信模板消息[小程序服务号统一消息]
     */
    WECHAT_MINIAPP_UNIMSG = 'wechat_mina_unimsg',
    /**
     * 微信小程序订阅消息通知
     */
    WECHAT_MINIAPP_SUBMSG = 'wechat_mina_submsg'
}

export interface WechatMsgMiniProgramDto {
    /**
      * 所需跳转到的小程序appid（该小程序 appid 必须与发模板消息的公众号是绑定关联关系，暂不支持小游戏）
      */
    appid: string

    /**
     * 所需跳转到小程序的具体页面路径，支持带参数,（示例index?foo=bar），要求该小程序已发布，暂不支持小游戏
     */
    pagepath: string
}

export interface WechatMsgDataDto {
    [key: string]: {
        value: string,
        color?: string
    }
}

/**
 * 公众号模板消息
 * url和 miniprogram 都是非必填字段，若都不传则模板无跳转；若都传，会优先跳转至小程序。开发者可根据实际需要选择其中一种跳转方式即可。当用户的微信客户端版本不支持跳小程序时，将会跳转至url。
 */
export interface WechatMpMsgDto {

    systemMsgId?: number

    user_id: string
    /**
     * 模板ID
     */
    template_id: string
    /**
     * 模板跳转链接（海外帐号没有跳转能力）
     */
    url?: string
    /**
     * 跳小程序所需数据，不需跳小程序可不用传该数据
     */
    miniprogram?: WechatMsgMiniProgramDto

    /**
     * 模板数据
     */
    data: WechatMsgDataDto

    /**
     * 防重入id。对于同一个openid + client_msg_id, 只发送一条消息,10分钟有效,超过10分钟不保证效果。若无防重入需求，可不填
     */
    client_msg_id?: string
}


export interface UniFormMsgMpTemplateMsgDto {
    /**
     * 所需跳转到的小程序appid（该小程序 appid 必须与发模板消息的公众号是绑定关联关系，暂不支持小游戏）
     */
    appid: string

    /**
       * 模板ID
       */
    template_id: string

    /**
    * 模板跳转链接（海外帐号没有跳转能力）
    */
    url: string
    /**
     * 跳小程序所需数据，不需跳小程序可不用传该数据
     */
    miniprogram: WechatMsgMiniProgramDto

    /**
     * 模板数据
     */
    data: WechatMsgDataDto
}

/**
 * 小程序服务号消息
 * 
 */
export interface WechatMiniappMsgDto {
    systemMsgId?: number
    user_id: string
    mp_template_msg: UniFormMsgMpTemplateMsgDto
}

/**
 * 小程序订阅消息
 * 
 */
export interface WechatMiniappSubscribeMsgDto {

    systemMsgId?: number

    user_id: string
    /**
     * 模板ID
     */
    template_id: string
    /**
     * 模板跳转链接（海外帐号没有跳转能力）
     */
    page?: string

    /**
     * 模板数据
     */
    data: WechatMsgDataDto
}