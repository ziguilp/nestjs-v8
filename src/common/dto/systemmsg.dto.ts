import { ApiProperty } from "@nestjs/swagger";
import { NotifyPipe } from "./base.dto";

export class MsgReadedDto {

    @ApiProperty({
        name: 'msgIds',
        type: [Number]
    })
    msgIds: number[]
}



export class SendSystemMsgDto {
    title: string
    content: string
    user_ids: string[]
    link: string = ''
    pipes: NotifyPipe[]
    /**
     * 微信公众号服务模板消息ID
     */
    WechatMpMsgTmapleId?: string
    WechatMpMsgTmapleData?: Object
    /**
     * 微信统一服务模板消息ID
     */
    WechatUniformMsgTmapleId?: string
    WechatUniformMsgTmapleData?: Object
}