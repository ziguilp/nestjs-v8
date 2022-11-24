/*
 * @Author: turbo 664120459@qq.com
 * @Date: 2022-11-24 10:44:10
 * @LastEditors: turbo 664120459@qq.com
 * @LastEditTime: 2022-11-24 11:02:08
 * @FilePath: /nestjs-v8/src/queue/producer/log.queue.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue, OnQueueCompleted } from '@nestjs/bull';
import { JobData } from '../dto/queue.dto';
import { OperateLog } from 'src/common/entity/operateLog.entity';
import { PlayReportDto } from 'src/common/dto/report.dto';

/**
 * 生产者
 */
@Injectable()
export class LogQueueService {
    constructor(@InjectQueue('log') private queue: Queue) { }
    /**
     * 接口请求日志
     * @returns 
     */
    async requestLog(params: OperateLog) {
        const job = await this.queue.add({
            method: 'requestLog',
            params
        } as JobData<OperateLog>, {
            removeOnComplete: true,
            delay: 1000 //延迟1s
        });
        return job
    }

}
