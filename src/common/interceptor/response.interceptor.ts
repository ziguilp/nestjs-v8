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
            .pipe(map(value => value === null ? '' : value))
            .pipe(map(data => (ResultData.ok(data))));
    }
}
