import { BadRequestException, CACHE_MANAGER, Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { isEmpty, isNotEmpty } from 'class-validator';
import { Request } from 'express';
import { UserInfoDto, UserStatusDto } from 'src/common/dto/auth.dto';
import { User } from 'src/common/entity/user.entity';
import { UserThirdAuth } from 'src/common/entity/userThirdAuth.entity';
import { RoleId } from 'src/constants';
import { Connection, getManager } from 'typeorm';
import { AuthService } from '../service/auth.service';
import { UserUtil } from '../utils/userUtil';
import { Gender, ThirdLoginResultDto, ThirdPlatformDto } from './third.dto';
import { WechatLib } from './wechat.lib';

@Injectable()
export class ThirdLoginService {

    private readonly logger = new Logger(ThirdLoginService.name);

    private wechatLib: WechatLib;

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly connection: Connection, @Inject(REQUEST) private readonly request: Request, private readonly authService: AuthService) {
        this.wechatLib = new WechatLib(this.cacheManager)
    }


    /**
     * 微信小程序登录
     * @returns 
     */
    async wechatMiniapp(): Promise<{
        thirdInfo: any;
        userInfo: UserInfoDto;
        access_token: string;
    }> {

        const client = await this.wechatLib.getWechatMiniAppClient()

        const { code, scene }: any = this.request.query;

        const {
            errcode, errmsg, openid, unionid,
        } = await client.auth.code2Session(
            code,
        );
        if (errcode) {
            throw new BadRequestException(errmsg);
        }
        if (!openid) {
            throw new ServiceUnavailableException('Login failed, openid is null.');
        }
        const third_info = {
            platform: ThirdPlatformDto.WECHAT_MINIAPP,
            openid,
            unionid,
            nickname: ''
        };

        return this.loginWithThirdInfo(third_info)

    }
    /**
     * 微信公众号登录
     * @returns 
     */
    wechatMp(): string {
        return 'wechatMp';
    }
    /**
     * 微信开放平台APP登录
     * @returns 
     */
    async wechatApp(): Promise<{
        thirdInfo: any;
        userInfo: UserInfoDto;
        access_token: string;
    }> {
        const client = await this.wechatLib.getWechatMpClient()

        const { code }: any = this.request.query;

        const { openid, access_token, expires_in } = await client.oauth.getUserAccessToken(
            code,
        );

        if (!openid) {
            throw new ServiceUnavailableException(`获取三方授权失败`)
        }

        const thirdUser = await client.oauth.getUserInfo(access_token, openid)

        if (!thirdUser) {
            throw new ServiceUnavailableException(`获取授权信息失败`)
        }

        const third_info = {
            platform: ThirdPlatformDto.WECHAT_OPENAPP,
            openid,
            unionid: thirdUser.unionid || null,
            nickname: thirdUser.nickname || '',
            avatar: thirdUser.headimgurl || '',
            gender: thirdUser.sex
        };

        return this.loginWithThirdInfo(third_info)
    }

    /**
     * 根据userId和platform获取授权信息，不存在的则写入
     * @param user 
     * @returns 
     */
    async getThirdInfo(user_id: string, platform: ThirdPlatformDto): Promise<UserThirdAuth> {
        return await UserUtil.getThirdInfo(user_id, platform)
    }

    /**
     * 根据三方用户信息注册或者登录，已经登录的用户会将三方授权绑定到该账号
     */
    async loginWithThirdInfo(thirdInfo: ThirdLoginResultDto) {
        let thirdUser = null, userInfo = null;

        thirdUser = await UserThirdAuth.findOne({
            third_platform: thirdInfo.platform,
            third_openid: thirdInfo.openid
        })

        if (!thirdUser) {

            let { user } = this.request

            let userId = user ? user.id : null;

            await getManager().transaction(async (manager) => {
                if (user) {
                    // 如果当前用户的头像，昵称信息为空，那么替换掉
                    let userUpdateData: any = {}
                    if (isEmpty(user.nickname) && isNotEmpty(thirdInfo.nickname)) {
                        userUpdateData.nickname = thirdInfo.nickname
                    }
                    if (isEmpty(user.avatar) && isNotEmpty(thirdInfo.avatar)) {
                        userUpdateData.avatar = thirdInfo.avatar
                    }

                    if (Object.keys(userUpdateData).length > 0) {
                        await manager.createQueryBuilder()
                            .update(User)
                            .set(userUpdateData)
                            .where({
                                id: user.id
                            })
                            .execute()
                    }
                }

                if (!userId) {
                    //注册新用户
                    let user = User.create({
                        role_id: RoleId.USER,
                        nickname: thirdInfo.nickname || `${thirdInfo.platform}-${thirdInfo.openid.substring(0, 6)}`,
                        avatar: thirdInfo.avatar || ``,
                        email: `${thirdInfo.platform}-${thirdInfo.openid}@${process.env.ACCOUNT_EMAIL_HOST || 'myturbo.com'}`,
                    })

                    const gePasw = this.authService.encryptPassword(user.password)
                    user.password = gePasw.password;
                    user.password_salt = gePasw.password_salt;
                    user.status = UserStatusDto.NORMAL;

                    this.logger.log(`saveData`, user)
                    const newuser = await manager.save(user)

                    userId = newuser.id;
                }

                thirdUser = await manager.save(UserThirdAuth.create({
                    third_platform: thirdInfo.platform,
                    third_openid: thirdInfo.openid,
                    third_unionid: thirdInfo.unionid || null,
                    name: thirdInfo.nickname || ``,
                    avatar: thirdInfo.avatar || ``,
                    user_id: userId
                }))
            })

        }

        userInfo = await this.authService.getUserInfoByUserId(thirdUser.user_id)

        const genToken = await this.authService.genToken(userInfo)

        return {
            ...genToken,
            thirdInfo: thirdUser
        }
    }

    /**
     * 解除三方授权绑定
     */
    async UnBindThirdInfo(user_id: string, platform: ThirdPlatformDto) {
        let thirdUser = await UserThirdAuth.findOne({
            third_platform: platform,
            user_id: user_id
        })

        if (!thirdUser) {
            throw new NotFoundException(`未找到授权信息或者已经解除授权`)
        }

        await thirdUser.softRemove()

        return true
    }

}
