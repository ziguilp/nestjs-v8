import { SetMetadata } from '@nestjs/common';

export interface RequestLockParams {
    /**
     * 锁的键名
     */
    key: string | Function,

    /**
     * 锁定时间s
     * 请求完成后立即释放
     */
    expiresIn: number
}

export const CustomMetaName_RequestLock = 'request-lock-for-user';

/**
 * 请求锁-针对同一用户的请求进行排它锁，防止并发
 * @param param.key 锁的键名 
 * @param param.expiresIn 锁定时间s 
 * @returns 
 */
export const RequestLock = (param: RequestLockParams) => SetMetadata(CustomMetaName_RequestLock, param);
