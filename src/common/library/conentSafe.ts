import * as BdAip from 'baidu-aip-sdk';
import { hasKey } from 'src/utils/util';

/**
 * 内容安全检查
 */
export class ContentSafe {

    private aipClient: any;

    constructor() {
        this.aipClient = new BdAip.contentCensor(process.env.BD_AIP_APPID, process.env.BD_AIP_KEY, process.env.BD_AIP_SECRET);
    }

    /**
     * 文本内容安全检查
     */
    async text(content: string): Promise<boolean> {
        const res = await this.aipClient.textCensorUserDefined(content)
        console.log(res)
        if (hasKey(res, 'error_code')) return false
        return true
    }
}