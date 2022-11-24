import { Body, CACHE_MANAGER, Controller, Get, Inject, Param, Post, Query, Req, ServiceUnavailableException, UploadedFiles } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { NotifyService } from '../service/notify.service';
import * as qiniu from 'qiniu';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Connection, getManager, Like } from 'typeorm';
import { appConfig } from 'src/config';
import { DoOperateLog, OperateLogLevel } from '../decorator/operatelog';
import { Rights } from '../decorator/rights';
import { PrinterService } from '../service/printer.service';
import { CaptchaSendDto, CaptchaVerifyBodyDto, CaptchaVerifyDto, CaptchaVerifyEventType, IPageDto, IPageResDto, NotifyDto, NotifyPipe } from '../dto/base.dto';
import { RequestLock } from '../decorator/request-lock';
import { Captcha } from '../decorator/api-captcha';
import { SystemMsgService } from '../service/systemMsg.service';
import { isAppVersion } from '../validators/version.validator';
import { getDeviceType } from 'src/utils/util';
import { AppPlatform } from '../dto/appVersion.dto';
import { AppVersionService } from '../service/appVersion.service';
import { ILegalReport } from '../entity/report.entity';
import { trim } from 'lodash';
import { isNotEmpty } from 'class-validator';
import { CACHE_KEY } from 'src/constants';
import { Cache } from 'cache-manager';
import { STS } from 'ali-oss';

/**
 * 全局模块
 */
@ApiTags('公共模块')
@Controller('common')
export class CommonController {

    constructor(@Inject(CACHE_MANAGER) private cache: Cache, private readonly notifyService: NotifyService, private readonly connection: Connection, private readonly printerService: PrinterService, @Inject(REQUEST) private readonly request: Request, private readonly systemMsgService: SystemMsgService, private readonly appVersionService: AppVersionService) { };



    /**
     * 读取七牛上传的token
     * @returns 
     */
    @ApiBearerAuth()
    @ApiOperation({
        summary: '获取七牛上传的token'
    })
    @Get('/qiniu/uploadToken')
    @Rights('get_upload_token')
    async getQiniuUpToken() {

        const key = `${CACHE_KEY.OSS_TOKEN}qiniu`
        let uploadToken = await this.cache.get(key)

        if (!uploadToken) {
            const accessKey = process.env.QN_ACCESS_KEY;
            const secretKey = process.env.QN_ACCESS_SECRET;

            if (!accessKey || !secretKey) {
                throw new ServiceUnavailableException(`七牛上传不可用`)
            }

            const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
            const options = {
                scope: process.env.QN_BUKET,
                expires: 7200
            };
            const putPolicy = new qiniu.rs.PutPolicy(options);
            uploadToken = putPolicy.uploadToken(mac);
            await this.cache.set(key, uploadToken, {
                ttl: 7000
            })
        }

        return { token: uploadToken, domain: process.env.QN_CDN_URL || appConfig.host };
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: '获取阿里云OSS上传的token'
    })
    @Get('/alioss/uploadToken')
    @Rights('get_upload_token')
    async getAliOssUpToken() {

        const key = `${CACHE_KEY.OSS_TOKEN}aliyun`
        let cacheSts = await this.cache.get(key)

        if (!cacheSts) {

            if (!process.env.ALIOSS_ACCESS_KEY_ID || !process.env.ALIOSS_ACCESS_KEY_SECRET) {
                throw new ServiceUnavailableException(`ALIOSS上传不可用`)
            }

            console.log({
                ALIOSS_ACCESS_KEY_ID: process.env.ALIOSS_ACCESS_KEY_ID,
                ALIOSS_ACCESS_KEY_SECRET: process.env.ALIOSS_ACCESS_KEY_SECRET,
                ALIOSS_ACCESS_RAM: process.env.ALIOSS_ACCESS_RAM
            })

            const sts = new STS({
                accessKeyId: process.env.ALIOSS_ACCESS_KEY_ID,
                accessKeySecret: process.env.ALIOSS_ACCESS_KEY_SECRET,
            })

            const res = await sts.assumeRole(process.env.ALIOSS_ACCESS_RAM, null, 3600, `uploader-${process.env.PROJECT_NAME}`)
                .catch(error => {
                    throw new ServiceUnavailableException(`获取OSS token失败:${error.message}`)
                })

            if (res.credentials) {
                cacheSts = res.credentials;
                await this.cache.set(key, res.credentials, {
                    ttl: 3480
                })
            } else {
                throw new ServiceUnavailableException(`获取OSS token失败`)
            }
        }


        return {
            ...(cacheSts as any),
            bucket: process.env.ALIOSS_ACCESS_BUCKET,
            region: process.env.ALIOSS_ACCESS_REGION,
            domain: process.env.ALIOSS_ACCESS_CDN_URL || appConfig.host
        };
    }

    /**
     * 文件上传
     */
    @ApiOperation({
        summary: '文件上传'
    })
    @Post("/upload")
    @Rights('file_upload')
    @DoOperateLog(OperateLogLevel.LEVEL_PATH)
    async Upload(@UploadedFiles() files, @Body("body") body) {
        for (const file of files) {
            const writeImage =
                createWriteStream(join(__dirname, '../../', 'public/upload', `${body.name}-${Date.now()}-${file.originalname}`));
            writeImage.write(file.buffer);
        }
        return '上传成功';
    }

    /**
     * 发送通知
     */
    @ApiOperation({
        summary: '发送系统消息'
    })
    // @ApiBearerAuth()
    @Post("/notify/systemmsg")
    // @Rights('systemmsg')
    async notifySendSystemMsg() {

        // return await this.systemMsgService.sendSystemMsg(null, '测试', '消息测试', ['13fc89b5-fef1-4a24-89b0-9bf105082503', '275cf68a-cc53-4b0d-8d95-d53890b7c30c', 'bbc99ff5-6c8e-4e14-8ce1-21c3c16b1d8a'], '', [NotifyPipe.WECHAT_MINIAPP_SUBMSG, NotifyPipe.WECHAT_MINIAPP_UNIMSG, NotifyPipe.WECHAT_MP_TEMPLATE])
    }

    /**
    * 发送公众号模板通知
    */
    @ApiOperation({
        summary: '发送公众号模板通知'
    })
    // @ApiBearerAuth()
    @Post("/notify/send/wechatmpmsg")
    // @Rights('notice_wechatmpmsg_send')
    async notifySendWechatMpMsg() {
        return await this.notifyService.notify({
            user_id: `275cf68a-cc53-4b0d-8d95-d53890b7c30c`,
            template_id: '0kITFz3XiodC2v3GbHdehX2kI-fWmiu36wlgnW7xpTM',
            data: {
                'trackno': {
                    value: "DPK2032991231",
                    color: '#000000'
                }
            }
        }, [NotifyPipe.WECHAT_MP_TEMPLATE])
    }

    /**
     * 发送验证码
     */
    @ApiOperation({
        summary: '发送验证码',
    })
    @ApiBody({
        type: CaptchaSendDto
    })
    @Post("/captcha/send")
    @RequestLock({
        key: `captchaSend`,
        expiresIn: 10
    })
    // @Rights("captcha_send")
    async captchaSend(@Body() form: CaptchaSendDto) {
        return await this.notifyService.sendCaptcha(form)
    }

    /**
     * 验证码验证
     */
    @ApiOperation({
        summary: '验证码验证示范',
        description: '注意：所有需要验证码验证的均按此结构传值,test默认验证码1234'
    })
    @ApiBody({
        type: CaptchaVerifyBodyDto
    })
    @Post("/captcha/verify")
    @RequestLock({
        key: `captchaVerify`,
        expiresIn: 10
    })
    @Captcha(CaptchaVerifyEventType.TEST)
    async captchaVerify(@Body() body: CaptchaVerifyBodyDto) {
        return `验证成功`
    }

    /**
     * 版本检查
     */
    @ApiOperation({
        summary: '版本检查,注意版本号通过header传值，version'
    })
    @Get('versionCheck')
    async versionCheck(@Req() req: Request) {
        const version: string = req.header('version') || (req.query.version as string) || req.params.version || '';
        if (!isAppVersion(version)) {
            throw new ServiceUnavailableException(`版本号无效`)
        }

        const platform = getDeviceType(req.headers)

        console.log(req.headers)
        if ([AppPlatform.ANDROID, AppPlatform.IOS].indexOf(platform) < 0) {
            throw new ServiceUnavailableException(`不支持的平台:${platform}`)
        }

        const res = await this.appVersionService.getNewestVersion(platform, version)

        if (!res) {
            return '当前已是最新版本'
        }

        return res
    }


    @ApiOperation({
        summary: '举报'
    })
    @ApiBody({
        type: ILegalReport
    })
    @Post('report')
    @RequestLock({
        key: 'ilegal_report',
        expiresIn: 10
    })
    async report(@Req() req: Request, @Body() data: ILegalReport) {
        if (req.user) {
            data.user_id = req.user.id;
        }
        return await ILegalReport.save(data)
    }


    @ApiOperation({
        summary: '后台读取举报列表'
    })
    @Rights("get_report_list")
    @Get('report/list')
    async reportList(@Req() req: Request, @Query('keyword') keyword: string, @Query() query: IPageDto<ILegalReport>) {
        keyword = trim(keyword).replace(/\%\,|。|\=|\？|\||\>|\<|\!/g, '');
        let page = Number(query.page || 1);
        let pageSize = Number(query.pageSize || 10);

        try {
            query.data = JSON.parse(query.data as any)
        } catch (error) {

        }

        const db = getManager().getRepository(ILegalReport)
            .createQueryBuilder();

        if (isNotEmpty(query.data.type)) {
            db.andWhere({
                type: query.data.type
            })
        }

        if (isNotEmpty(query.data.status)) {
            db.andWhere({
                status: query.data.status
            })
        }

        if (isNotEmpty(keyword)) {
            db.andWhere({
                reason: Like(`%${keyword}%`),
            })
        }


        let orderBy: any = {
            id: 'DESC'
        }

        if (query.sortBy) {
            orderBy = JSON.parse(query.sortBy as any)
        }


        const [list, total] = await db.skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(orderBy)
            .getManyAndCount();

        return {
            list,
            total,
            currentPage: page,
            pageSize
        } as IPageResDto<ILegalReport>
    }
}
