import { ServiceUnavailableException } from "@nestjs/common";
import { WechatTemplates } from "src/config";
import { hasKey } from "src/utils/util";
import { WechatMsgDataDto } from "../dto/base.dto";

export class WechatTemplateMsgLib {

    static buildMsgDataByTemplateId(templateId: string, data: Object): WechatMsgDataDto {
        const tmp = WechatTemplates[templateId]
        if (!tmp) {
            throw new ServiceUnavailableException(`模板${templateId}配置未找到`)
        }
        return tmp.fields.reduce((p: WechatMsgDataDto, k: string) => {
            if (hasKey(data, k)) {
                p[k] = data[k]
            }
            return p
        }, {} as WechatMsgDataDto)
    }
}