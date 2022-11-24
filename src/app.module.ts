/*
 * @Author: turbo 664120459@qq.com
 * @Date: 2022-11-24 10:44:10
 * @LastEditors: turbo 664120459@qq.com
 * @LastEditTime: 2022-11-24 10:50:44
 * @FilePath: /nestjs-v8/src/app.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { CacheModule, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, DiscoveryService, MetadataScanner } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/jwt.guard';
import { CommonModule } from './common/common.module';
import * as redisStore from 'cache-manager-redis-store';
import { cacheConfig } from './config';
import { RequestLockInterceptor } from './common/interceptor/RequestLock.interceptor';
import { LogisticModule } from './logistic/logistic.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './cron/cron.module';
import { QueueModule } from './queue/queue.module';
import { TestController } from './test.controller';
import { CmsModule } from './cms/cms.module';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as WinstonCloudWatch from 'winston-cloudwatch';
import { WinstonTraceUtil } from './common/service/winston.service';

let transports: any[] = [new winston.transports.Console()]

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.CLOUDWATCH_GROUP_NAME) {
    transports.push(new WinstonCloudWatch({
        name: "Cloudwatch Logs",
        logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
        logStreamName: process.env.CLOUDWATCH_STREAM_NAME,
        jsonMessage: true
    }))
}

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: async () => {
                const cf = Object.assign(await getConnectionOptions(), {
                    entities: [__dirname + '/*/entity/*.entity.js', __dirname + '/*/viewentity/*.entity.js']
                })
                return cf;
            }
        }),
        CacheModule.register({
            store: redisStore,
            ...cacheConfig
        }),
        WinstonModule.forRoot({
            format: winston.format.combine(
                winston.format.colorize(),
                WinstonTraceUtil.format.traceId(),
                winston.format.timestamp(),
                winston.format.ms(),
                nestWinstonModuleUtilities.format.nestLike(process.env.PROJECT_NAME || 'my-nest-app', {
                    prettyPrint: true,
                    colors: true
                }),
            ),
            transports,
        }),
        ScheduleModule.forRoot(),
        TasksModule,
        QueueModule,
        CommonModule,
        AuthModule,
        LogisticModule,
        OrderModule,
        PaymentModule,
        CmsModule,
    ],
    controllers: [
        AppController,
        TestController
    ],
    providers: [
        AppService,
        DiscoveryService,
        MetadataScanner,
        {
            provide: APP_GUARD,
            useClass: JwtGuard
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: RequestLockInterceptor
        }
    ],
})
export class AppModule { }
