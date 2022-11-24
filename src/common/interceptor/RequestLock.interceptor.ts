import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, CACHE_MANAGER, BadGatewayException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { Reflector, REQUEST } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { Observable, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotifyService } from '../service/notify.service';
import { CustomMetaName_Captcha } from '../decorator/api-captcha';
import { CaptchaVerifyBodyDto, CaptchaVerifyEventType } from '../dto/base.dto';
import { hasKey } from 'src/utils/util';
import { isObject } from 'class-validator';

@Injectable()
export class RequestLockInterceptor implements NestInterceptor {

    private readonly logger = new Logger(RequestLockInterceptor.name);

    constructor(private reflector: Reflector, @Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly notifyService: NotifyService) { }


    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

        const request: Request = context.switchToHttp().getRequest();
        const captcha_verify = this.reflector.get<CaptchaVerifyEventType>(CustomMetaName_Captcha, context.getHandler());
        this.logger.log('Before...');

        return next
            .handle()
            .pipe(
                tap(async () => {
                    if (request.reqLockKey) {
                        this.logger.log(`请求完成，释放拦截锁🔐`)
                        await this.cacheManager.del(request.reqLockKey)
                    }
                    if (captcha_verify) {
                        this.logger.log(`含有验证码的请求完成，清除验证过的验证码`)
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

                        await this.notifyService.flushCaptchVerify({
                            username: verifyUsername,
                            event: verifyEvent as any,
                            captcha: verifyCaptcha
                        })
                    }
                }),
                catchError(async (err) => {
                    console.error(err)
                    if (request.reqLockKey) {
                        this.logger.log(`异常导致释放拦截锁🔐`)
                        await this.cacheManager.del(request.reqLockKey)
                    }
                    throw err
                }),
            )
    }
}