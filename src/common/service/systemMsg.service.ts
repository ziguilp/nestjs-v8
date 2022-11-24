import { Injectable } from "@nestjs/common";
import { generateOrderNo } from "src/utils/util";
import { SendSystemMsgDto } from "../dto/systemmsg.dto";
import { SystemMsg } from "../entity/systemMsg.entity";
import { WechatTemplateMsgLib } from "../library/wechatTemplateMsg";
import { NotifyService } from "./notify.service";

@Injectable()
export class SystemMsgService {

    constructor(private readonly notifyService: NotifyService) {

    }

    /**
     * 系统消息
     */
    async sendSystemMsg(data: SendSystemMsgDto) {

        const msg_no = generateOrderNo()

        let msgs: SystemMsg[] = data.user_ids.map((user_id: string) => {
            return SystemMsg.create({
                msg_no,
                user_id,
                title: data.title,
                content: data.content,
                pipes: data.pipes || [],
                link: data.link,
            })
        })

        const records = await SystemMsg.save(msgs)

        if ((data.pipes || []).length == 0) return records;

        for (let index = 0; index < records.length; index++) {
            const ele = records[index];
            let notifyData: any = {
                systemMsgId: ele.id,
                title: data.title,
                content: data.content,
                user_id: ele.user_id,
                url: data.link,
                page: data.link,
            }
            if (data.WechatMpMsgTmapleId && data.WechatMpMsgTmapleData) {
                notifyData.template_id = data.WechatMpMsgTmapleId;
                notifyData.data = WechatTemplateMsgLib.buildMsgDataByTemplateId(data.WechatMpMsgTmapleId, data.WechatMpMsgTmapleData);
            }
            if (data.WechatUniformMsgTmapleId && data.WechatUniformMsgTmapleData) {
                notifyData.mp_template_msg = {
                    template_id: data.WechatUniformMsgTmapleId,
                    appid: process.env.WECHAT_MP_APPID,
                    data: WechatTemplateMsgLib.buildMsgDataByTemplateId(data.WechatUniformMsgTmapleId, data.WechatUniformMsgTmapleData),
                    url: data.link,
                    miniprogram: {
                        appid: process.env.WECHAT_MINIAPPID,
                        pagepath: data.link
                    }
                }
            }
            await this.notifyService.notify(notifyData, data.pipes, false)
        }
        return records
    }
}