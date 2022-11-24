import { Controller, Get, Param, All, HttpException, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserInfoDto } from 'src/common/dto/auth.dto';
import { toHump } from 'src/utils/util';
import { ThirdLoginService } from './login.service';
import { ThirdPlatformDto } from './third.dto';

/**
 * 第三方登录
 */
@ApiTags('第三方登录授权')
@Controller('/auth/third/login')
export class thirdLoginController {
    constructor(private readonly LoginService: ThirdLoginService) { }

    @All('/')
    index(): string {
        return '第三方登录'
    }

    /**
     * 三方登录
     * @returns 
     */
    @ApiOperation({
        summary: '微信登录'
    })
    @ApiParam({
        name: "platform",
        description: "登录平台：",
        enum: ThirdPlatformDto
    })
    @Get('/wechat/:platform')
    async wechat(@Param('platform') platform: ThirdPlatformDto, @Req() req: any): Promise<{
        thirdInfo: any;
        userInfo: UserInfoDto;
        access_token: string;
    }> {
        const platformName = toHump(platform)
        try {
            return await this.LoginService[platformName](req);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 解绑三方
     * @returns 
     */
    @ApiOperation({
        summary: '解绑三方微信绑定'
    })
    @ApiParam({
        name: "platform",
        description: "登录平台：",
        enum: ThirdPlatformDto
    })
    @ApiBearerAuth()
    @Get('/unbindWechatThird/:platform')
    async unbindWechatThird(@Param('platform') platform: ThirdPlatformDto, @Req() req: Request): Promise<boolean> {
        try {
            return this.LoginService.UnBindThirdInfo(req.user.id, platform);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
