/*
 * @Author: turbo 664120459@qq.com
 * @Date: 2022-11-24 10:44:10
 * @LastEditors: turbo 664120459@qq.com
 * @LastEditTime: 2022-11-24 12:21:33
 * @FilePath: /nestjs-v8/src/main.ts
 * @Description: 入口文件
 */

/**
 * @description: 这里是加载env环境配置的，不要改动
 */
import * as dotenv from 'dotenv';
dotenv.config()

import './utils/number';
import { NestContainer, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from './config';
import { createNamespace } from 'cls-hooked';
import * as requestIp from 'request-ip';
import { ValidationPipe } from '@nestjs/common';
import { UserInfoDto } from './common/dto/auth.dto';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { Request } from 'express';
import { WinstonLogger, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

/**
 * @description: 重新申明
 */
declare global {
    namespace Express {
        interface User extends UserInfoDto { }
        interface Request {
            traceId?: string,
            clientIp?: string,
            reqLockKey?: string
        }
    }
}

/**
 * @description: 主程序启动
 */
async function bootstrap() {
    const namespace = createNamespace(appConfig.appNameSpace)

    const app = await NestFactory.create(AppModule, {
        logger: ['debug', 'error', 'warn', 'log']
    });

    const logger: WinstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);

    app.enableCors()
    app.useGlobalPipes(new ValidationPipe())
    app.useLogger(logger)

    app.use((req: Request, res, next) => {
        namespace.run(() => {

            namespace.bindEmitter(req)
            namespace.bindEmitter(res)
            const requestId = uuidv4();

            req.clientIp = requestIp.getClientIp(req);

            req.traceId = requestId;

            console.log(`======set-trace-id=====`, requestId);
            console.log(`======clientIp=====`, req['clientIp']);
            namespace.set('traceId', requestId);
            next();
        });
    })


    const options = new DocumentBuilder()
        .setTitle(`${process.env.SYS_NAME || ''}接口文档`)
        .setDescription('XXXXXXXXXXX')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    app.useGlobalInterceptors(new ResponseInterceptor());
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api-doc', app, document);

    await app.listen(appConfig.port);

    logger.log(`服务已启动: 接口文档地址-${appConfig.host}/api-doc`);
}
bootstrap();
