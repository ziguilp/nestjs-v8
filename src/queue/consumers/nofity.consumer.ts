import { Process, Processor } from '@nestjs/bull';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotifyDto, WechatMiniappMsgDto, WechatMiniappSubscribeMsgDto, WechatMpMsgDto } from 'src/common/dto/base.dto';
import { NotifyService } from 'src/common/service/notify.service';
import { JobData } from '../dto/queue.dto';

@Processor('notify')
export class NotifyCustomer {
    private readonly logger = new Logger(NotifyCustomer.name);

    constructor(@Inject(forwardRef(() => NotifyService)) private readonly notifyService: NotifyService) {

    }

    @Process()
    async handle(job: Job) {
        this.logger.debug('nofity队列消费...');

        const data: JobData<any> = job.data

        try {
            if ('function' == typeof this[data.method]) {
                return await this[data.method](data.params)
            } else {
                throw new Error(`nofity队列方法不存在：${data.method}`)
            }
        } catch (error) {
            this.logger.debug('============nofity队列出错=========');
            this.logger.error(error)
            throw error
        } finally {
            this.logger.debug('nofity队列消费完成 completed');
        }
    }


    async sms(data: NotifyDto) {
        return await this.notifyService.sms(data, true)
    }

    async email(data: NotifyDto) {
        return await this.notifyService.email(data, true)
    }

    async wechatMpMsg(data: WechatMpMsgDto) {
        return await this.notifyService.wechatMpMsg(data, true)
    }

    async wechatMiniappMsg(data: WechatMiniappMsgDto) {
        return await this.notifyService.wechatMiniappMsg(data, true)
    }

    async wechatMiniappSubscribeMsg(data: WechatMiniappSubscribeMsgDto) {
        return await this.notifyService.wechatMiniappSubscribeMsg(data, true)
    }

}