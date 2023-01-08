/*
 * @Author        : turbo 664120459@qq.com
 * @Date          : 2022-11-24 10:44:10
 * @LastEditors   : turbo 664120459@qq.com
 * @LastEditTime  : 2023-01-08 11:16:20
 * @FilePath      : /nestjs-v8/src/common/interceptor/response.interceptor.ts
 * @Description   : 
 * 
 * Copyright (c) 2023 by turbo 664120459@qq.com, All Rights Reserved. 
 */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResultData } from '../dto/base.dto';

export interface Response<T> {
    data: T;
    message: string;
    statusCode: number;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(map(value => 'undefined' === typeof value ? '' : value))
            .pipe(map(value => value === null ? '' : value))
            .pipe(map(data => (ResultData.ok(data))));
    }
}
