import { Body, Controller, Get, Inject, Param, Post, Query, Req, ServiceUnavailableException, UploadedFiles } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NotifyService } from '../service/notify.service';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Connection, In, IsNull, MoreThanOrEqual } from 'typeorm';
import { PrinterService } from '../service/printer.service';
import { SystemMsgService } from '../service/systemMsg.service';
import { SystemMsg } from '../entity/systemMsg.entity';
import { ViewSystemMsg } from '../viewentity/viewSystemMsg.entity';
import { IPageDto, IPageResDto, NotifyPipe } from '../dto/base.dto';
import { MsgReadedDto } from '../dto/systemmsg.dto';
import * as moment from 'moment';

/**
 * 消息模块
 */
@ApiTags('消息模块')
@Controller('sysmsg')
export class SystemMsgController {

    constructor(private readonly notifyService: NotifyService, private readonly connection: Connection, private readonly printerService: PrinterService, @Inject(REQUEST) private readonly request: Request, private readonly systemMsgService: SystemMsgService) { };

    /**
     * 用户读取系统消息
     * @returns 
     */
    @ApiBearerAuth()
    @ApiOperation({
        summary: '用户读取系统消息'
    })
    @Get('/list')
    async list(@Req() req: Request, @Query() query: IPageDto<SystemMsg>) {
        const pageSize = query.pageSize || 10;
        const page = query.page || 1
        const [list, total] = await this.connection.manager.getRepository(ViewSystemMsg).createQueryBuilder()
            .where({
                user_id: req.user.id,
                date_deleted: IsNull()
            })
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy({
                id: 'DESC'
            })
            .getManyAndCount()

        return {
            list,
            total,
            currentPage: Number(page),
        } as IPageResDto<ViewSystemMsg>;
    }



    /**
     * 标记消息为已读
     */
    @ApiOperation({
        summary: '消息标记为已读'
    })
    @ApiBody({
        type: MsgReadedDto
    })
    @Post('msgRead')
    @ApiBearerAuth()
    async readed(@Req() req: Request, @Body() data: MsgReadedDto) {
        const res = await SystemMsg.createQueryBuilder().update().where({
            user_id: req.user.id,
            id: In(data.msgIds)
        }).set({
            readed: true
        })
            .execute()

        return res.affected
    }

}
