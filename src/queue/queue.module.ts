/*
 * @Author: turbo 664120459@qq.com
 * @Date: 2022-11-24 10:44:10
 * @LastEditors: turbo 664120459@qq.com
 * @LastEditTime: 2022-11-24 11:01:09
 * @FilePath: /nestjs-v8/src/queue/queue.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { queueConfig } from 'src/config';
import { LogCustomer } from './consumers/log.consumer';
import { NotifyCustomer } from './consumers/nofity.consumer';
import { LogQueueService } from './producer/log.queue';
import { NotifyQueueService } from './producer/nofity.queue';

@Module({
    imports: [
        forwardRef(() => CommonModule),
        BullModule.registerQueue({
            name: 'log',
            redis: {
                ... (queueConfig as any)
            }
        }),
        BullModule.registerQueue({
            name: 'notify',
            redis: {
                ... (queueConfig as any)
            }
        }),
    ],
    controllers: [],
    providers: [LogQueueService, LogCustomer, NotifyQueueService, NotifyCustomer],
    exports: [LogQueueService, NotifyQueueService]
})
export class QueueModule {

}