/*
 * @Author        : turbo 664120459@qq.com
 * @Date          : 2022-11-24 10:44:10
 * @LastEditors   : turbo 664120459@qq.com
 * @LastEditTime  : 2023-01-08 10:09:57
 * @FilePath      : /nestjs-v8/src/auth/jwt.guard.ts
 * @Description   : 
 * 
 * Copyright (c) 2022 by turbo 664120459@qq.com, All Rights Reserved. 
 */
import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException, ServiceUnavailableException, ForbiddenException, CACHE_MANAGER, Logger, forwardRef } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { Reflector } from '@nestjs/core';
import { UserInfoDto, UserStatusDto } from 'src/common/dto/auth.dto';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { OperateLog } from 'src/common/entity/operateLog.entity';
import { OperateLogParams } from 'src/common/dto/operatelog.dto';
import { CustomMetaName_OperateLog, OperateLogLevel } from 'src/common/decorator/operatelog';
import { CustomMetaName_RequestLock, RequestLockParams } from 'src/common/decorator/request-lock';
import { Cache } from 'cache-manager';
import { LogQueueService } from 'src/queue/producer/log.queue';
import { Request } from 'express';
import { CustomMetaName_Rights } from 'src/common/decorator/rights';
import { CaptchaVerifyDto, CaptchaVerifyEventType } from 'src/common/dto/base.dto';
import { CustomMetaName_Captcha } from 'src/common/decorator/api-captcha';
import { NotifyService } from 'src/common/service/notify.service';
import { hasKey } from 'src/utils/util';
import { isObject } from 'class-validator';

@Injectable()
export class JwtGuard implements CanActivate {

    private readonly logger = new Logger(JwtGuard.name);

    constructor(private reflector: Reflector, private readonly authservice: AuthService,
        @Inject(CACHE_MANAGER) private cache: Cache,
        @Inject(forwardRef(() => LogQueueService)) private readonly logQueue: LogQueueService,
        @Inject(forwardRef(() => NotifyService)) private readonly notifyService: NotifyService) {
    }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        this.logger.log(`======traceId=====`, request.traceId)
        const needAuth = this.reflector.get<string>('swagger/apiSecurity', context.getHandler());
        const rights: string | null = this.reflector.get<string>(CustomMetaName_Rights, context.getHandler());
        const requestLock = this.reflector.get<RequestLockParams>(CustomMetaName_RequestLock, context.getHandler());
        const captcha_verify = this.reflector.get<CaptchaVerifyEventType>(CustomMetaName_Captcha, context.getHandler());
        const doOperatelog: OperateLogLevel | undefined = this.reflector.get<OperateLogLevel>(CustomMetaName_OperateLog, context.getHandler());

        console.log(`needAuth`, needAuth)
        this.logger.log(`???????????????????????????`, rights)
        this.logger.log(`???????????????????????????`, doOperatelog)
        this.logger.log(`?????????????????????????????????`, captcha_verify)

        let authorizationEd = false;

        try {

            // ???????????????
            if (captcha_verify) {
                const verifyData: any = request.body;
                let verifyEvent = '', verifyCaptcha = '', verifyUsername = '';
                if (hasKey(verifyData, 'captchaVerifyData') && isObject(verifyData.captchaVerifyData)) {
                    verifyEvent = verifyData.captchaVerifyData.event;
                    verifyCaptcha = verifyData.captchaVerifyData.captcha;
                    verifyUsername = verifyData.captchaVerifyData.username;
                } else {
                    verifyEvent = verifyData.event;
                    verifyCaptcha = verifyData.captcha;
                    verifyUsername = verifyData.username;
                }

                if (!verifyEvent || !verifyCaptcha || !verifyUsername || verifyEvent != captcha_verify) {
                    throw new ServiceUnavailableException("??????????????????");
                }

                let verify = false

                if (verifyEvent === CaptchaVerifyEventType.TEST || process.env.CAPCHA_VERIFY_TEST) {
                    verify = verifyCaptcha === String(process.env.CAPCHA_VERIFY_TEST || '1234')
                } else {
                    verify = await this.notifyService.captchaVerify({
                        event: verifyEvent,
                        username: verifyUsername,
                        captcha: verifyCaptcha,
                    } as CaptchaVerifyDto)
                }

                if (!verify) {
                    throw new ForbiddenException("???????????????");
                }
            }

            // ??????jwt-?????????
            const access_token = request.headers.authorization || request.body.access_token || request.params.access_token || request.query.access_token;
            if (access_token) {
                this.logger.log('?????????????????????', access_token, request.user)
                const payload: any = await this.authservice.parseJwtToken(access_token.replace(`Bearer `, ''))
                this.logger.log(payload)
                if (payload) {
                    const user: UserInfoDto = await this.authservice.getUserInfo({
                        where: { id: payload.userId }
                    })
                    if (!user) {
                        throw new UnauthorizedException("???????????????");
                    }

                    if (user.status != UserStatusDto.NORMAL) {
                        throw new UnauthorizedException("??????????????????");
                    }
                    this.logger.log(`????????????????????????`, user)
                    request.user = user;

                    if (user.role_rights && user.role_rights.indexOf("*") > -1) {
                        //???????????????
                        authorizationEd = true;
                    }

                    //????????????
                    if (!authorizationEd && rights && user.role_rights.indexOf(rights) < 0) {
                        this.logger.log(`???????????????????????????${user.role_name}`);
                        throw new ForbiddenException("??????????????????");
                    }
                    authorizationEd = true;
                } else {
                    //????????????
                    if (rights) {
                        this.logger.log(`????????????????????????`)
                        throw new UnauthorizedException("????????????");
                    }
                    authorizationEd = true;
                }
            } else {

                if (needAuth && needAuth.length > 0) {
                    this.logger.log(`????????????????????????`)
                    throw new UnauthorizedException("????????????");
                }

                //????????????
                if (rights) {
                    this.logger.log(`????????????????????????`)
                    throw new UnauthorizedException("????????????");
                }

                authorizationEd = true;
            }


        } catch (error) {
            if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError || error instanceof UnauthorizedException) {
                throw new UnauthorizedException(error.message)
            }
            throw new ServiceUnavailableException(error.message);
        }

        if (!authorizationEd) {
            throw new UnauthorizedException('???????????????')
        }

        try {
            // ????????????
            if (doOperatelog !== OperateLogLevel.LEVEL_NONE) {
                this.logQueue.requestLog(OperateLog.create({
                    user_id: request.user ? request.user.id : null,
                    path: request.path,
                    params: doOperatelog === OperateLogLevel.LELVEL_FULL ? {
                        query: request.query,
                        params: request.params,
                        body: request.body,
                        traceId: request.traceId
                    } as OperateLogParams : {
                        traceId: request.traceId
                    },
                    ip: request.clientIp
                }))
            }
        } catch (error) {
            this.logger.error(error)
        }

        if (requestLock) {
            // ?????????????
            this.logger.log(`????????????????????????????`, requestLock);
            let key = `req-lock:`;
            if ('function' === typeof requestLock.key) {
                key = `${key}${requestLock.key(request)}`
            } else {
                key = `${key}${request.user ? request.user.id : (request.clientIp || '')}:${requestLock.key}`;
            }
            this.logger.log(`===?????????:key===`, key)
            request.reqLockKey = key;
            if (await this.cache.get(key)) {
                throw new ServiceUnavailableException(`???????????????`)
            }
            await this.cache.set(key, 1, {
                ttl: requestLock.expiresIn
            })
            this.logger.log(`???????????????${requestLock.expiresIn}s`)
        }

        return authorizationEd;
    }
}
