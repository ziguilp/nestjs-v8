import * as JPush from 'jpush-async';
import { JpushConfig } from 'src/config';

export interface JPushExtra {
    linkType: 'none' | 'channel' | 'item' | 'h5',
    linkUrl: string,
    params: { [key: string]: any } //channel、item实例为 {id:1}
}

export class JPushLib {
    private client: any;
    constructor() {
        this.client = JPush.buildClient({
            appKey: JpushConfig.appKey,
            masterSecret: JpushConfig.appSecret,
            isDebug: false
        })
    }

    /**
     * 发送推送
     * @param users all或者指定用户ID，多个用,拼接
     * @oaram notification 通知标题
     * @oaram content 通知内容
     */
    async send(users: string, notification: string, content: string, extra: JPushExtra = {
        linkType: 'none',
        linkUrl: '',
        params: {}
    }) {
        const res = await this.client.push().setPlatform(JPush.ALL)
            .setAudience(users.toUpperCase() === 'ALL' ? JPush.ALL : JPush.alias(users))
            .setNotification(content,
                JPush.ios(content, '', null, false, extra),
                JPush.android(content, notification, null, extra),
            )
            .setMessage(content, notification)
            .send()
        return res
    }
}