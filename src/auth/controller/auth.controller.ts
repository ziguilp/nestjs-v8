import { Controller, Get, Post, Param, Body, UseGuards, Req, UnauthorizedException, Query, ServiceUnavailableException, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto, ModifyPasswordDto, RegDto, UserBaseInfoDto, UserInfoDto } from '../../common/dto/auth.dto';
import { User } from 'src/common/entity/user.entity';
import { AuthService } from '../service/auth.service';
import { CaptchaVerifyBodyDto, CaptchaVerifyEventType, IPageDto, IPageResDto } from 'src/common/dto/base.dto';
import { isEmail, isEmpty, isNotEmpty, isNumber, isUUID } from 'class-validator';
import { Rights } from 'src/common/decorator/rights';
import { hasKey, isMobile } from 'src/utils/util';
import { ViewUser } from 'src/common/viewentity/viewUser.entity';
import { OperateLog } from 'src/common/entity/operateLog.entity';
import { DoOperateLog, OperateLogLevel } from 'src/common/decorator/operatelog';
import { Request } from 'express';
import { Role } from 'src/common/entity/role.entity';
import { RoleId, RoleName } from 'src/constants';
import { Captcha } from 'src/common/decorator/api-captcha';
import random from 'string-random';

@ApiTags('用户模块')
@Controller("/auth")
export class AuthController {

    private readonly logger = new Logger(AuthController.name);

    constructor(private readonly authService: AuthService) { }

    /**
     * 添加管理员
     * @returns 
     */
    @ApiOperation({
        summary: '添加管理员'
    })
    @ApiBody({ type: RegDto })
    @ApiBearerAuth()
    @DoOperateLog(OperateLogLevel.LEVEL_PATH)
    @Rights("create_admin")
    @Post('/regAdmin')
    async regAdmin(@Body() user: RegDto): Promise<User> {
        const u = await this.authService.adminReg(user as User);
        return u;
    }


    /**
     * 账密登录
     */
    @ApiOperation({
        summary: '账密登录'
    })
    @ApiBody({ type: LoginDto })
    @Post("/login")
    @DoOperateLog(OperateLogLevel.LEVEL_PATH)
    async login(@Body("username") username: string, @Body("password") password: string): Promise<any> {
        const u = await this.authService.login(username, String(password));
        return u;
    }

    /**
     * 验证码登录
     */
    @ApiOperation({
        summary: '验证码登录,如果账号不存在，直接注册账号,验证事件：' + CaptchaVerifyEventType.LOGIN
    })
    @ApiBody({ type: CaptchaVerifyBodyDto })
    @Post("/loginByCaptcha")
    @Captcha(CaptchaVerifyEventType.LOGIN)
    @DoOperateLog(OperateLogLevel.LEVEL_PATH)
    async loginByCaptcha(@Body() data: any): Promise<any> {
        const username = hasKey(data, 'captchaVerifyData') ? data.captchaVerifyData.username : data.username;
        let user = await this.authService.getUserInfoByUserName(username);
        if (!user) {
            // 直接注册为用户身份
            let userData = User.create({})
            if (isMobile(username)) {
                userData.mobile = username
            } else if (isEmail(username)) {
                userData.email = username
            } else {
                throw new ServiceUnavailableException(`注册手机号或者邮箱无效`)
            }
            userData.password = random(16)
            let reg = await this.authService.userReg(userData)
            user = await this.authService.getUserInfoByUserId(reg.id)
        }
        return await this.authService.genToken(user);
    }

    /**
     * 退出
     */
    @ApiBearerAuth()
    @Get("/logout")
    async logout(): Promise<any> {
        return true;
    }

    /**
     * token刷新
     */
    @ApiBearerAuth()
    @Post("/refresh")
    async refreshToken(@Req() req) {
        return await this.authService.genToken(req.user)
    }

    /**
     * 读取当前登录用户信息
     * 
     */
    @Get("/userInfo")
    @ApiBearerAuth()
    async getUserInfo(@Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException("没有登录");
        }
        return req.user;
    }

    @ApiOperation({
        summary: '读取用户信息'
    })
    @Get("/userInfo/:userId")
    @Rights("read_userinfo")
    @ApiBearerAuth()
    async getUserInfoByUserId(@Param('userId') userId: string) {
        try {
            const userInfo: any = await this.authService.getUserInfoByUserId(userId);
            return userInfo
        } catch (error) {
            this.logger.error(error)
        }

    }

    /**
     * 读取会员列表
     * 
     */
    @ApiOperation({
        summary: '读取会员列表'
    })
    @Get("/userlist")
    @Rights("read_userlist")
    @ApiBearerAuth()
    async getUserList(@Query('keyword') keyword: string, @Query('page') page: number = 1) {

        let where: any = {
            role_name: 'user'
        };
        if (isNotEmpty(keyword)) {
            if (isMobile(keyword)) {
                where.mobile = keyword;
            } else {
                where.email = keyword;
            }
        }


        const [list, total]: any = await this.authService.getList({
            page,
            pageSize: 10,
        } as IPageDto<any>, {
            where,
            select: [...this.authService.userBaseInfoColumns, 'vip_expire_time'],
            order: {
                date_created: "ASC"
            }
        })

        const res: IPageResDto<ViewUser> = {
            currentPage: page,
            pageSize: 10,
            list,
            total
        }

        return res
    }

    /**
     * 读取管理员列表
     * 
     */
    @ApiOperation({
        summary: '读取管理员列表'
    })
    @Get("/adminlist")
    @Rights("read_adminlist")
    @ApiBearerAuth()
    async getAdminList(@Query('keyword') keyword: string, @Query('page') page: number = 1) {

        let where: any = {
            role_name: 'admin'
        };
        if (isNotEmpty(keyword)) {
            if (isMobile(keyword)) {
                where.mobile = keyword;
            } else {
                where.email = keyword;
            }
        }


        const [list, total]: any = await this.authService.getList({
            page,
            pageSize: 10,
        } as IPageDto<any>, {
            where,
            select: this.authService.userBaseInfoColumns,
            order: {
                date_created: "ASC"
            }
        })

        const res: IPageResDto<ViewUser> = {
            currentPage: page,
            pageSize: 10,
            list,
            total
        }

        return res
    }

    /**
     * 密码修改
     */
    @ApiBody({
        type: ModifyPasswordDto
    })
    @ApiOperation({
        summary: '密码修改,需要验证码，验证事件：' + CaptchaVerifyEventType.MODIFY_PASSWORD
    })
    @Post("/modify/password")
    @DoOperateLog(OperateLogLevel.LEVEL_PATH)
    @Captcha(CaptchaVerifyEventType.MODIFY_PASSWORD)
    @ApiBearerAuth()
    async modifyPassword(@Req() req: Request, @Body("old_password") old_password: string, @Body("new_password") new_password: string, @Body("captcha") captcha: string) {
        if (isEmpty(old_password) || isEmpty(new_password)) {
            throw new ServiceUnavailableException('密码不能为空')
        }
        if (old_password === new_password) {
            throw new ServiceUnavailableException('新旧密码不能相同')
        }
        req.user['password'] = new_password;
        return await this.authService.modifyUserInfo(req.user as any)
    }

    /**
     * 密码重置
     */
    @ApiBody({
        type: ModifyPasswordDto
    })
    @ApiOperation({
        summary: '密码重置,需要验证码，验证事件：' + CaptchaVerifyEventType.RESET_PASSWORD
    })
    @DoOperateLog(OperateLogLevel.LEVEL_PATH)
    @Rights("reset_userpwd")
    @Captcha(CaptchaVerifyEventType.RESET_PASSWORD)
    @Post("/reset/password")
    async resetPassword(@Body() form: ModifyPasswordDto) {
        const user: UserInfoDto = await this.authService.getUserInfoByUserName(form.username) as UserInfoDto;
        if (!user) {
            throw new ServiceUnavailableException('账号不存在')
        }
        const userSave = new User();
        userSave.id = user.id;
        userSave.password = form.new_password;
        return await this.authService.modifyUserInfo(userSave);
    }


    /**
     * 读取权限列表
     */
    @ApiOperation({ summary: '读取权限列表' })
    @Get('rightslist')
    async getRightsList(@Req() req: Request) {
        if (!req.user) return [];
        return await this.authService.getAuthRightsTree(req.user)
    }

    /**
     * 操作日志
     */
    @ApiOperation({ summary: '读取操作日志' })
    @ApiBearerAuth()
    @DoOperateLog(OperateLogLevel.LEVEL_NONE)
    @Rights('read_operatorlog')
    @Get('operatorLog')
    async getOperatorLogs(@Query('page') page: number, @Query('user_id') user_id: string, @Query('pageSize') pageSize: number) {
        let where: any = {

        }

        if (user_id && isUUID(user_id)) {
            where.user_id = user_id;
        }

        if (isEmpty(page) || !isNumber(parseInt(String(page))) || page < 1) {
            page = 1
        }

        if (isEmpty(pageSize) || !isNumber(parseInt(String(pageSize))) || pageSize < 2) {
            pageSize = 10
        }

        const [list, total] = await OperateLog.findAndCount({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            order: {
                id: 'DESC'
            }
        })

        return {
            total,
            list,
            pageSize,
            currentPage: page
        } as IPageResDto<OperateLog>
    }

    @ApiOperation({
        summary: '修改用户基本信息',
        description: '头像、昵称、性别、生日等'
    })
    @Post("/modify/baseuserInfo")
    @ApiBearerAuth()
    async modifyBaseInfo(@Body() body: UserBaseInfoDto, @Req() req: Request) {
        try {
            let userData = User.create({})
            if (body.avatar) {
                userData.avatar = body.avatar
            }
            if (body.nickname) {
                userData.nickname = body.nickname
            }
            if (body.birthday) {
                userData.nickname = body.nickname
            }
            if (Object.keys(userData).length > 0) {
                await User.getRepository().update({
                    id: req.user.id
                }, userData)

                return this.authService.getUserInfoByUserId(req.user.id)
            }
            return req.user
        } catch (error) {
            this.logger.error(error)
            throw error
        }

    }

    /**
     * 系统初始化添加超级管理员账户
     * 
     */
    @ApiOperation({
        summary: '系统初始化添加超级管理员账户'
    })
    @ApiBody({
        type: RegDto
    })
    @Post('createSa')
    async sa(@Body() user: RegDto) {
        const sa = await User.createQueryBuilder().where({
            role_id: RoleId.SUPERADMIN
        }).getOne()
        if (sa) {
            throw new ServiceUnavailableException(`已经存在超级管理员`)
        }
        let saRole = await Role.createQueryBuilder().where(`rights::text = '["*"]'`).getOne()
        if (!saRole) {
            saRole = await Role.save(Role.create({
                name: RoleName.SUPERADMIN,
                rights: ['*'],
                explain: '超级管理员'
            }))
        }
        user.role_id = saRole.id;
        return await this.authService.adminReg(user as User);
    }

    // /**
    //  * 系统初始化添加商户角色
    //  * 
    //  */
    // @ApiOperation({
    //     summary: '系统初始化添加商户角色'
    // })
    // @Post('createMerchantRole')
    // async createMerchantRole() {
    //     let saRole = await Role.createQueryBuilder().where({
    //         name: RoleName.MERCHANT
    //     }).getOne()
    //     if (!saRole) {
    //         saRole = await Role.save(Role.create({
    //             name: RoleName.MERCHANT,
    //             rights: [],
    //             explain: '商户'
    //         }))
    //     }
    //     return saRole
    // }


    /**
     * 系统初始化添加用户角色
     * 
     */
    @ApiOperation({
        summary: '系统初始化添加用户角色'
    })
    @Post('createUserRole')
    async createUserRole() {
        let saRole = await Role.createQueryBuilder().where({
            name: RoleName.USER
        }).getOne()
        if (!saRole) {
            saRole = await Role.save(Role.create({
                name: RoleName.USER,
                rights: [],
                explain: '用户'
            }))
        }
        return saRole
    }

}
