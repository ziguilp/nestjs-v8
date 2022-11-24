/*
 * @Author: turbo 664120459@qq.com
 * @Date: 2022-11-24 10:44:10
 * @LastEditors: turbo 664120459@qq.com
 * @LastEditTime: 2022-11-24 11:01:45
 * @FilePath: /nestjs-v8/src/queue/consumers/log.consumer.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PlayReportDto } from 'src/common/dto/report.dto';
import { OperateLog } from 'src/common/entity/operateLog.entity';
import { JobData } from '../dto/queue.dto';

@Processor('log')
export class LogCustomer {
    private readonly logger = new Logger(LogCustomer.name);

    @Process()
    async handle(job: Job) {
        this.logger.debug('日志队列消费...');

        const data: JobData<any> = job.data

        try {
            if ('function' == typeof this[data.method]) {
                return await this[data.method](data.params)
            } else {
                throw new Error(`日志队列方法不存在：${data.method}`)
            }
        } catch (error) {
            this.logger.debug('============日志队列出错=========');
            this.logger.error(error)
            throw error
        } finally {
            this.logger.debug('日志队列消费完成 completed');
        }
    }

    /**
     * api请求日志
     * @param data 
     * @returns 
     */
    async requestLog(data: OperateLog) {
        return await OperateLog.save(OperateLog.create(data))
    }
}