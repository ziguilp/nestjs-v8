import { CACHE_MANAGER, forwardRef, Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { SMTPClient, Message } from 'emailjs';
import random from 'string-random';
import { isEmail } from 'class-validator';
import { isMobile } from 'src/utils/util';
import { CACHE_KEY } from 'src/constants';
import { Cache } from 'cache-manager';
import { CaptchaSendDto, CaptchaVerifyDto, CaptchaVerifyEventType, NotifyDto, NotifyPipe, WechatMiniappMsgDto, WechatMiniappSubscribeMsgDto, WechatMpMsgDto } from '../dto/base.dto';
import { LkSmsLibrary } from '../library/lksms';
import { NotifyQueueService } from 'src/queue/producer/nofity.queue';
import { ThirdPlatformDto } from 'src/auth/third/third.dto';
import { WechatLib } from 'src/auth/third/wechat.lib';
import { UserUtil } from 'src/auth/utils/userUtil';
import axios from 'axios';
import { User } from '../entity/user.entity';
import { SystemMsg } from '../entity/systemMsg.entity';

@Injectable()
export class NotifyService {

    private readonly logger = new Logger(NotifyService.name);


    constructor(@Inject(CACHE_MANAGER) private cache: Cache,
        @Inject(forwardRef(() => NotifyQueueService)) private readonly notifyQueue: NotifyQueueService) {
    }

    /**
     * 发送验证码,仅支持一个接收者
     * @param data 
     * @param directLy 直接发送/通过队列发送
     * @returns 
     */
    async sendCaptcha(data: CaptchaSendDto, directLy: boolean = false) {
        const captcha = random(4, {
            numbers: true,
            letters: false,
        });
        let notify = new NotifyDto();
        notify.receiver = [data.username];
        notify.title = `验证码`;
        notify.content = `你的验证码是：${captcha}，10分钟内有效。如非本人操作请忽略！`;
        let sent = false;
        const receiver = notify.receiver instanceof Array ? notify.receiver[0] : notify.receiver;

        const sendedLogKey = `${CACHE_KEY.CAPTCHA_LIMIT}:${data.event}:${receiver}`

        const sendtedLast = await this.cache.get(sendedLogKey);

        if (sendtedLast) {
            throw new ServiceUnavailableException('发送过于频繁');
        }

        if (isEmail(receiver)) {
            sent = await this.email(notify, directLy)
        }
        else if (isMobile(receiver)) {
            sent = await this.sms(notify, directLy)
        } else {
            throw new ServiceUnavailableException('接收者无效');
        }

        if (!sent) {
            throw new ServiceUnavailableException('发送失败');
        }



        const key = `${CACHE_KEY.CAPTCHA}:${data.event || ''}:${receiver}`

        await this.cache.set(key, captcha, {
            ttl: 600
        });

        await this.cache.set(sendedLogKey, 1, {
            ttl: 60
        });

        return true;
    }

    /**
     * 短信发送
     * @param directLy 直接发送/通过队列发送
     */
    async sms(notify: NotifyDto, directLy: boolean = false): Promise<boolean> {

        if (!directLy) {
            await this.notifyQueue.sms(notify)
            return true
        }

        const lk = new LkSmsLibrary()
        const res = await lk.setReceiver(notify.receiver).setMessageContent(notify.content).send()
        if (res) {
            this.notifyDone(notify, NotifyPipe.SMS)
        }
        return res
    }


    /**
     * 邮件发送
     * @param directLy 直接发送/通过队列发送
     */
    async email(notify: NotifyDto, directLy: boolean = false): Promise<boolean> {

        if (!directLy) {
            await this.notifyQueue.email(notify)
            return true
        }

        const client = new SMTPClient({
            user: 'turbole@126.com',
            password: 'FAYDHQLPZJNLZLNB',
            host: 'smtp.126.com',
            ssl: true,
        });

        try {
            const message = new Message({
                text: notify.content,
                from: `${process.env.SYS_NAME}<turbole@126.com>`,
                to: notify.receiver.join(","),
                subject: notify.title,
                attachment: [
                    // { data: '<html>i <i>hope</i> this works!</html>', alternative: true },
                    // { path: 'path/to/file.zip', type: 'application/zip', name: 'renamed.zip' },
                ],
            });
            const res = await client.sendAsync(message)

            if (res) {
                this.notifyDone(notify, NotifyPipe.EMAIL)
            }
            return res ? true : false

        } catch (err) {
            this.logger.error(err);
            throw new ServiceUnavailableException(err.message);
        }
    }


    /**
     * 发送公众号模板消息
     * @param data 
     * @returns 
     */
    async wechatMpMsg(data: WechatMpMsgDto, directLy: boolean = false) {
        if (!directLy) {
            await this.notifyQueue.wechatMpMsg(data)
            return true
        }
        // 读取openID
        const third = await UserUtil.getThirdInfo(data.user_id, ThirdPlatformDto.WECHAT_MP)

        if (!third) {
            this.logger.error(`给用户${data.user_id}发送微信模板通知失败，未绑定`)
        }

        try {
            const client = await (new WechatLib(this.cache)).getWechatMpClient()
            const res = await client.templateMessage.send({
                ...data,
                touser: third.third_openid
            })
            if (res === 'ok') {
                this.notifyDone(data, NotifyPipe.WECHAT_MP_TEMPLATE)
            }
            return res === 'ok'
        } catch (error) {
            console.error(error)
            this.logger.error(`给用户${data.user_id}发送微信模板通知失败:${error.message}`)
            // this.logger.error(error)
        }

    }


    /**
     * 小程序统一服务消息：发送小程序关联订阅号的公众号模板消息
     * @param data 
     * @returns 
     */
    async wechatMiniappMsg(data: WechatMiniappMsgDto, directLy: boolean = false) {
        if (!directLy) {
            await this.notifyQueue.wechatMiniappMsg(data)
            return true
        }
        // 读取openID
        const third = await UserUtil.getThirdInfo(data.user_id, ThirdPlatformDto.WECHAT_MINIAPP)

        if (!third) {
            this.logger.error(`给用户${data.user_id}发送统一服务通知失败，未绑定`)
        }

        try {
            const client = await (new WechatLib(this.cache)).getWechatMiniAppClient()
            const res = await client.uniformMessage.send({
                ...data,
                touser: third.third_openid
            })
            console.log(`统一服务通知`, res)
            if (res) {
                this.notifyDone(data, NotifyPipe.WECHAT_MINIAPP_UNIMSG)
            }
            return res.errmsg
        } catch (error) {
            console.error(error)
            this.logger.error(`给用户${data.user_id}发送统一服务通知失败:${error.message}`)
            // this.logger.error(error)
        }

    }

    /**
     * 发送小程序订阅的模板消息
     * @param data 
     * @returns 
     */
    async wechatMiniappSubscribeMsg(data: WechatMiniappSubscribeMsgDto, directLy: boolean = false) {
        if (!directLy) {
            await this.notifyQueue.wechatMiniappSubscribeMsg(data)
            return true
        }
        // 读取openID
        const third = await UserUtil.getThirdInfo(data.user_id, ThirdPlatformDto.WECHAT_MINIAPP)

        if (!third) {
            this.logger.error(`给用户${data.user_id}发送统一服务通知失败，未绑定`)
        }

        try {
            const client = await (new WechatLib(this.cache)).getWechatMiniAppClient()
            const access_token = await client.getAccessToken()

            const postData = {
                ...data,
                touser: third.third_openid
            }
            delete postData.user_id

            const res = await axios({
                url: `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,
                method: 'POST',
                data: postData
            })
            console.log(`订阅消息通知`, res)
            if (res) {
                this.notifyDone(data, NotifyPipe.WECHAT_MINIAPP_SUBMSG)
            }
            return res
        } catch (error) {
            console.error(error)
            this.logger.error(`给用户${data.user_id}发送订阅消息通知失败:${error.message}`)
            // this.logger.error(error)
        }

    }


    /**
     * 验证码验证
     * @param username 邮箱或者手机号
     * @param event 验证码事件
     * @param captcha 验证码
     */
    async captchaVerify(data: CaptchaVerifyDto): Promise<boolean> {

        const key = `${CACHE_KEY.CAPTCHA}:${data.event || ''}:${data.username}`

        const savedCaptcha = await this.cache.get(key);

        this.logger.log(`缓存读取验证码:${data.username}`, savedCaptcha)

        return data.captcha && savedCaptcha === data.captcha ? true : false;
    }

    /**
     * 验证码验证之后清理验证码
     */
    async flushCaptchVerify(data: CaptchaVerifyDto): Promise<void> {
        const key = `${CACHE_KEY.CAPTCHA}:${data.event || ''}:${data.username}`

        await this.cache.del(key);
    }

    /**
     * 发送系统通知
     * 
     * @param notify
     * @param pipes 发送通道
     * @param directLy 直接发送/通过队列发送
     */
    async notify(notify: NotifyDto | WechatMpMsgDto | WechatMiniappMsgDto | WechatMiniappSubscribeMsgDto, pipes: NotifyPipe[], directLy: boolean = false) {
        if (pipes.indexOf(NotifyPipe.WECHAT_MP_TEMPLATE) > -1) {
            try {
                this.wechatMpMsg(notify as WechatMpMsgDto, directLy)
            } catch (error) {

            }
        }

        if (pipes.indexOf(NotifyPipe.WECHAT_MINIAPP_UNIMSG) > -1) {
            try {
                this.wechatMiniappMsg(notify as WechatMiniappMsgDto, directLy)
            } catch (error) {

            }
        }

        if (pipes.indexOf(NotifyPipe.WECHAT_MINIAPP_SUBMSG) > -1) {
            try {
                this.wechatMiniappSubscribeMsg(notify as WechatMiniappSubscribeMsgDto, directLy)
            } catch (error) {

            }
        }

        if (pipes.indexOf(NotifyPipe.EMAIL) > -1) {
            try {
                if (!(notify as NotifyDto).receiver || !isEmail((notify as NotifyDto).receiver[0])) {
                    if ((notify as any).user_id) {
                        const user = await User.findOne({ id: (notify as any).user_id });
                        (notify as NotifyDto).receiver = [user.email];
                    }
                }
                this.email(notify as NotifyDto, directLy)
            } catch (error) {

            }
        }


        if (pipes.indexOf(NotifyPipe.SMS) > -1) {
            try {
                if (!(notify as NotifyDto).receiver || !isMobile((notify as NotifyDto).receiver[0])) {
                    if ((notify as any).user_id) {
                        const user = await User.findOne({ id: (notify as any).user_id });
                        (notify as NotifyDto).receiver = [user.mobile];
                    }
                }
                this.sms(notify as NotifyDto, directLy)
            } catch (error) {

            }
        }
    }

    /**
     * 完成发送之后的处理
     */
    async notifyDone(notify: NotifyDto | WechatMpMsgDto | WechatMiniappMsgDto, pipe: NotifyPipe) {
        console.log(`消息通知完毕`, notify, `'{ "${pipe}": true }'`)
        if (notify.systemMsgId) {
            try {
                await SystemMsg.createQueryBuilder().update().where({
                    id: notify.systemMsgId
                }).set({
                    result: () => `result || '{"${pipe}":true}'`
                }).execute()
            } catch (error) {

            }
        }
    }
}
