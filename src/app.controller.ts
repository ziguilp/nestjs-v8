/*
 * @Author        : turbo 664120459@qq.com
 * @Date          : 2022-11-24 10:44:10
 * @LastEditors   : turbo 664120459@qq.com
 * @LastEditTime  : 2023-01-08 11:16:33
 * @FilePath      : /nestjs-v8/src/app.controller.ts
 * @Description   : 
 * 
 * Copyright (c) 2023 by turbo 664120459@qq.com, All Rights Reserved. 
 */
import { Controller, Get, Query, Req, ServiceUnavailableException } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import * as moment from 'moment';
import { Connection, In, IsNull, MoreThan, Not } from 'typeorm';
import { AppService } from './app.service';
import { Rights } from './common/decorator/rights';
import { User } from './common/entity/user.entity';
import { RoleId } from './constants';

@ApiTags('全局应用')
@Controller()
export class AppController {

    constructor(private readonly appService: AppService, private readonly connection: Connection) { }

    @ApiOperation({
        summary: '所有接口的headers公共参数',
    })
    @ApiHeader({
        name: 'client',
        description: 'moyu-android/moyu-ios',
        example: 'moyu-android'
    })
    @ApiHeader({
        name: 'version',
        description: 'app版本号',
        example: '1.0.0'
    })
    @ApiHeader({
        name: 'Authorization',
        description: 'Bearer token',
        example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDcxY2Q1Zi00NWM1LTQwM2ItYTU4ZS00NzYwNDE0YThlNjQiLCJ1c2VySWQiOiI4NDcxY2Q1Zi00NWM1LTQwM2ItYTU4ZS00NzYwNDE0YThlNjQiLCJyb2xlSWQiOjEsImh0dHBzOi8vaGFzdXJhLmlvL2p3dC9jbGFpbXMiOnsieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJzdXBlcmFkbWluIl0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InN1cGVyYWRtaW4iLCJ4LWhhc3VyYS1yb2xlIjoic3VwZXJhZG1pbiIsIngtaGFzdXJhLXVzZXItaWQiOiI4NDcxY2Q1Zi00NWM1LTQwM2ItYTU4ZS00NzYwNDE0YThlNjQifSwiaWF0IjoxNjU5MjU3NDEwLCJleHAiOjE2NTkyNjQ2MTB9.ZbsI7h5mPCCiBuESgfGKMzFtg3BNQblSrDiWl_5iPUQ'
    })
    @Get('/headers')
    async headers(@Req() req: Request) {
        return {
            headers: req.headers,
            params: req.params,
            body: req.body,
            query: req.query,
            cookies: req.cookies || {},
            ip: req.clientIp
        }
    }

    @ApiOperation({
        summary: '控制台',
        description: '控制台'
    })
    @ApiBearerAuth()
    @Get("dashboard")
    async dashboard(@Req() req: Request) {

        try {
            let result: any = {};
            let day7 = moment().add(-7, 'days').utcOffset('+08')

            result.userTotal = await User.createQueryBuilder().where({
                role_id: RoleId.USER
            }).getCount()

            result.userTotal7d = await User.createQueryBuilder().where({
                role_id: RoleId.USER,
                date_created: MoreThan(day7)
            }).getCount()

            result.chart30 = {
                users: await User.getRepository().query(`
                    SELECT
                    date_trunc('DAY', date_created)::date date,
                    count(*)
                    FROM "public".users
                    WHERE role_id = 2 and date_created > now() - '30days'::INTERVAL
                    GROUP BY date
                    ORDER BY date asc
                `),
            }
            return result;
        } catch (error) {
            throw new ServiceUnavailableException(error.message)
        }
    }

    /**
     * 权限配置刷新
     */
    @ApiOperation({
        summary: '接口权限配置扫描到数据库',
        description: '将控制器中的权限配置刷新到数据库'
    })
    @ApiBearerAuth()
    @Rights('refreshRights')
    @Get("refreshRights")
    @ApiQuery({
        name: 'flush',
        description: '强制刷新',
        type: Boolean
    })
    async refreshRights(@Query('flush') flush: boolean = false) {
        return await this.appService.scan(flush)
    }
}