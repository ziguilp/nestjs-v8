import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue, OnQueueCompleted } from '@nestjs/bull';
import { JobData } from '../dto/queue.dto';
import { NotifyDto, WechatMiniappMsgDto, WechatMiniappSubscribeMsgDto, WechatMpMsgDto } from 'src/common/dto/base.dto';

/**
 * 生产者
 */
@Injectable()
export class NotifyQueueService {
    constructor(@InjectQueue('notify') private queue: Queue) { }
    /**
     * 发送短信
     * @returns 
     */
    async sms(params: NotifyDto) {
        const job = await this.queue.add({
            method: 'sms',
            params
        } as JobData<NotifyDto>, {
            removeOnComplete: true,
            delay: 1000 //延迟1s
        });
        return job
    }

    /**
     * 发送邮件
     * @returns 
     */
    async email(params: NotifyDto) {
        const job = await this.queue.add({
            method: 'email',
            params
        } as JobData<NotifyDto>, {
            removeOnComplete: true,
            delay: 1000 //延迟1s
        });
        return job
    }

    /**
     * 微信公众号消息
     * @returns 
     */
    async wechatMpMsg(params: WechatMpMsgDto) {
        const job = await this.queue.add({
            method: 'wechatMpMsg',
            params
        } as JobData<WechatMpMsgDto>, {
            removeOnComplete: true,
            delay: 1000 //延迟1s
        });
        return job
    }

    /**
     * 小程序发服务号消息
     * @returns 
     */
    async wechatMiniappMsg(params: WechatMiniappMsgDto) {
        const job = await this.queue.add({
            method: 'wechatMiniappMsg',
            params
        } as JobData<WechatMiniappMsgDto>, {
            removeOnComplete: true,
            delay: 1000 //延迟1s
        });
        return job
    }


    /**
     * 小程序订阅消息
     * @returns 
     */
    async wechatMiniappSubscribeMsg(params: WechatMiniappSubscribeMsgDto) {
        const job = await this.queue.add({
            method: 'wechatMiniappSubscribeMsg',
            params
        } as JobData<WechatMiniappSubscribeMsgDto>, {
            removeOnComplete: true,
            delay: 1000 //延迟1s
        });
        return job
    }
}
