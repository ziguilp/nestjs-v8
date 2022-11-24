import { SetMetadata } from '@nestjs/common';

/**
 * 操作日志等级
 */
export enum OperateLogLevel {
    /**
     * 不记录
     */
    LEVEL_NONE,
    /**
     * 仅仅记录路由
     */
    LEVEL_PATH,
    /**
     * 记录数据
     */
    LELVEL_FULL
}

export const CustomMetaName_OperateLog = 'operatelog';

export const DoOperateLog = (log: OperateLogLevel) => SetMetadata(CustomMetaName_OperateLog, log);
