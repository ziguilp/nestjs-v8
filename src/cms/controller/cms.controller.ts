import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { query, Request } from "express";
import * as moment from "moment";
import { RequestLock } from "src/common/decorator/request-lock";
import { Rights } from "src/common/decorator/rights";
import { IPageDto, IPageResDto } from "src/common/dto/base.dto";
import { LessThan, Like, MoreThan } from "typeorm";
import { CmsContent } from "../entity/cmsContent.entity";
import { CmsPage } from "../entity/cmsPage.entity";
import { CmsService } from "../service/cms.service";

/**
 * cms模块
 */
@ApiTags('cms模块')
@Controller('cms')
export class CmsController {

    constructor(private readonly cmsService: CmsService) {

    }

    @ApiOperation({
        summary: '新增/修改PAGE'
    })
    @Post('page/save')
    @ApiBody({
        type: CmsPage
    })
    @RequestLock({
        key: 'cms_page_edit',
        expiresIn: 10
    })
    @ApiBearerAuth()
    @Rights('cms_page_edit')
    async savePage(@Body() data: CmsPage) {
        return await CmsPage.save(data)
    }

    @ApiOperation({
        summary: '删除PAGE'
    })
    @Post('page/delete/:id')
    @ApiBearerAuth()
    @Rights('cms_page_del')
    async delPage(@Param('id') id: number) {
        return await CmsPage.createQueryBuilder().where({
            id,
        }).softDelete().execute()
    }

    @ApiOperation({
        summary: '新增/修改content'
    })
    @Post('content/save')
    @ApiBody({
        type: CmsContent
    })
    @RequestLock({
        key: 'cms_content_edit',
        expiresIn: 10
    })
    @ApiBearerAuth()
    @Rights('cms_content_edit')
    async saveContent(@Body() data: CmsContent) {
        return await this.cmsService.saveConent(data)
    }

    @ApiOperation({
        summary: '删除content'
    })
    @Post('content/delete/:id')
    @ApiBearerAuth()
    @Rights('cms_content_del')
    async delContent(@Param('id') id: number) {
        return await CmsContent.createQueryBuilder().where({
            id,
        }).softDelete().execute()
    }

    /**
     * 页面读取
     */
    @ApiOperation({
        summary: '读取页面'
    })
    @Get('page/list')
    @ApiBearerAuth()
    @ApiQuery({
        type: IPageDto
    })
    @Rights('cms_page')
    async getCmsPage(@Query() query: IPageDto<CmsPage>) {

        const page = query.page || 1;
        const pageSize = query.pageSize || 10;

        const db = CmsPage.createQueryBuilder()

        try {
            query.data = query.data ? JSON.parse(query.data as any) : {}
        } catch (error) {

        }

        if (query.data.name) {
            console.log(`按名字检索`)
            db.andWhere({
                name: Like(`%${query.data.name}%`)
            })
        }

        const [list, total] = await db.take(pageSize).skip((page - 1) * pageSize).orderBy({
            id: 'DESC'
        }).getManyAndCount()


        return {
            list,
            total,
            currentPage: Number(page),
        } as IPageResDto<CmsPage>
    }

    /**
     * 读取内容
     */
    @ApiOperation({
        summary: '管理端读取内容'
    })
    @Get('content/list')
    @ApiBearerAuth()
    @ApiQuery({
        type: IPageDto
    })
    @Rights('cms_content')
    async getCmsContent(@Req() req: Request, @Query() query: IPageDto<CmsContent>) {

        const page = query.page || 1;
        const pageSize = query.pageSize || 10;

        const db = CmsContent.createQueryBuilder('c').leftJoinAndSelect('c.cmsPage', 'cmsPage')

        try {
            query.data = query.data ? JSON.parse(query.data as any) : {}
        } catch (error) {

        }

        if (query.data.title) {
            db.andWhere({
                name: Like(`%${query.data.title}%`)
            })
        }

        if (query.data.alias) {
            db.andWhere({
                alias: Like(`%${query.data.alias}%`)
            })
        }

        if (query.data.position) {
            db.andWhere({
                position: query.data.position
            })
        }

        if (query.data.page_id) {
            db.andWhere({
                page_id: query.data.page_id
            })
        }

        const [list, total] = await db.take(pageSize).skip((page - 1) * pageSize).orderBy({
            'c.id': 'DESC'
        }).getManyAndCount()


        return {
            list,
            total,
            currentPage: Number(page),
        } as IPageResDto<CmsContent>
    }

    @ApiOperation({
        summary: '根据位置读取列表'
    })
    @Get('contentlist/position/:position')
    @ApiParam({
        name: 'position',
        type: String
    })
    async getContentListByPosition(@Param('position') position: string) {
        return await CmsContent.createQueryBuilder().where({
            position,
            date_show_start: LessThan(moment()),
            date_show_end: MoreThan(moment())
        }).orderBy({
            sort: 'DESC',
            id: 'DESC'
        }).getMany()
    }

    @ApiOperation({
        summary: '根据ID读取Content详情'
    })
    @Get('content/:id')
    @ApiParam({
        name: 'id',
        type: Number
    })
    async getContentById(@Param('id') id: number) {
        return await CmsContent.createQueryBuilder().where({
            id,
            date_show_start: LessThan(moment()),
            date_show_end: MoreThan(moment())
        }).getOneOrFail()
    }

    @ApiOperation({
        summary: '根据别名读取详情'
    })
    @Get('content/detail/:alias')
    @ApiParam({
        name: 'alias',
        type: String
    })
    async getContentByAlias(@Param('alias') alias: string) {
        return await CmsContent.createQueryBuilder().where({
            alias,
            date_show_start: LessThan(moment()),
            date_show_end: MoreThan(moment())
        }).getOneOrFail()
    }
}