import { Injectable, Inject, ServiceUnavailableException, UnauthorizedException, CACHE_MANAGER, Logger } from '@nestjs/common';
import { User } from 'src/common/entity/user.entity';
import random from 'string-random';
import { AES } from 'crypto-js';
import { hasKey, isMobile } from 'src/utils/util';
import { JwtService } from '@nestjs/jwt';
import { LoginRestDto, PasswordDto, UserInfoDto, UserInfoWithPasswordDto, UserStatusDto } from 'src/common/dto/auth.dto';
import { isEmpty, isEmail } from 'class-validator';
import { IPageDto } from 'src/common/dto/base.dto';
import { ViewUser } from 'src/common/viewentity/viewUser.entity';
import { Role } from 'src/common/entity/role.entity';
import { Connection, In, IsNull } from 'typeorm';
import { Cache } from 'cache-manager';
import { CACHE_KEY, RoleId } from 'src/constants';
import { AuthRights } from 'src/common/entity/authRights.entity';


@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    public userBaseInfoColumns: string[] = ["id", "nickname", "role_id", "avatar", "mobile", "nation_code", "email", "status", "gender", "date_created", 'role_name', 'role_rights', 'role_date_deleted', 'birthday', 'intro', 'location'];
    public userWithPwdInfoColumns: string[] = this.userBaseInfoColumns.concat(['password', 'password_salt']);

    constructor(private readonly jwtService: JwtService, private readonly connection: Connection, @Inject(CACHE_MANAGER) private cacheManager: Cache) {

    }

    /**
     * 用户注册
     * @param user 
     * @returns 
     */
    async userReg(user: User): Promise<User> {

        // 普通用户的
        user.role_id = RoleId.USER

        if (!user.password) {
            throw new ServiceUnavailableException('请设置密码');
        }

        if (isEmpty(user.mobile) && isEmpty(user.email)) {
            throw new ServiceUnavailableException('参数错误');
        }

        if (user.mobile) {
            if (!isMobile(user.mobile)) {
                throw new ServiceUnavailableException('手机号码错误');
            }
            const existUser = await User.findOne({ mobile: user.mobile })
            if (existUser) {
                this.logger.log(`已存在用户`, existUser);
                throw new ServiceUnavailableException('手机号已使用');
            }
            if (isEmpty(user.nickname)) {
                user.nickname = user.mobile
            }
        }

        if (user.email) {
            if (!isEmail(user.email)) {
                throw new ServiceUnavailableException('邮箱格式错误');
            }
            const existUser = await User.findOne({ email: user.email })
            if (existUser) {
                this.logger.log(`已存在用户`, existUser);
                throw new ServiceUnavailableException('邮箱已使用');
            }
            if (isEmpty(user.nickname)) {
                user.nickname = (user.email.split(`@`))[0]
            }
        }
        user.status = UserStatusDto.NORMAL
        const gePasw = this.encryptPassword(user.password)
        user.password = gePasw.password;
        user.password_salt = gePasw.password_salt;
        return await User.save(user);
    }

    /**
     * 管理员注册
     * @param user 
     * @returns 
     */
    async adminReg(user: User): Promise<User> {

        if (isEmpty(user.role_id)) {
            throw new ServiceUnavailableException('请选择角色');
        }

        if (!user.password) {
            throw new ServiceUnavailableException('请设置密码');
        }

        if (isEmpty(user.mobile) && isEmpty(user.email)) {
            throw new ServiceUnavailableException('参数错误');
        }

        //校验管理角色
        const role = await Role.findOne({
            id: user.role_id
        })

        if (!role) {
            throw new ServiceUnavailableException('角色不存在');
        }

        if (user.mobile) {
            if (!isMobile(user.mobile)) {
                throw new ServiceUnavailableException('手机号码错误');
            }
            const existUser = await User.findOne({ mobile: user.mobile })
            if (existUser) {
                this.logger.log(`已存在用户`, existUser);
                throw new ServiceUnavailableException('手机号已使用');
            }
        }

        if (user.email) {
            if (!isEmail(user.email)) {
                throw new ServiceUnavailableException('邮箱格式错误');
            }
            const existUser = await User.findOne({ email: user.email })
            if (existUser) {
                this.logger.log(`已存在用户`, existUser);
                throw new ServiceUnavailableException('邮箱已使用');
            }
        }
        const gePasw = this.encryptPassword(user.password)
        if (isEmpty(user.status)) {
            user.status = UserStatusDto.NORMAL
        }
        user.password = gePasw.password;
        user.password_salt = gePasw.password_salt;
        return await User.save(User.create(user));
    }

    /**
     * 账密登录
     */
    async login(username: string, password: string) {

        let user: UserInfoWithPasswordDto = await this.getUserSenceInfo(username);

        if (!user) {
            throw new UnauthorizedException("账号或密码错误");
        }

        if (AES.decrypt(this.encryptPassword(password, user.password_salt).password, user.password_salt).toString() !== AES.decrypt(user.password, user.password_salt).toString()) {
            throw new UnauthorizedException("账号或者密码错误");
        }

        if (user.status != UserStatusDto.NORMAL) {
            throw new UnauthorizedException("账号已被锁定");
        }

        return this.genToken(user);
    }

    /**
     * 读取用户信息含密码
     * @param username 
     * @returns 
     */
    async getUserSenceInfo(username: string): Promise<ViewUser> {
        let user: ViewUser = null;
        if (isMobile(username)) {
            user = await this.connection.manager.getRepository(ViewUser)
                .findOne({
                    mobile: username
                })
        } else if (isEmail(username)) {
            user = await this.connection.manager.getRepository(ViewUser)
                .findOne({
                    email: username
                })
        } else {
            throw new ServiceUnavailableException("无法识别用户名");
        }
        this.logger.log("========getUserSenceInfo========", username, user)
        return user;
    }

    /**
     * 根据邮箱或者手机号获取用户基本信息
     * @param username 
     * @returns 
     */
    async getUserInfoByUserName(username: string): Promise<UserInfoDto | null> {
        let user: any = null;
        if (isMobile(username)) {
            user = (await this.getUserInfo({
                where: {
                    mobile: username
                }
            }))
        } else if (isEmail(username)) {
            user = (await this.getUserInfo({
                where: {
                    email: username
                }
            }))
        } else {
            throw new ServiceUnavailableException("无法识别用户名");
        }
        this.logger.log("========getUserInfoByUserName========", username, user)
        if (user) {
            if (hasKey(user, `password`)) delete user.password;
            if (hasKey(user, `password_salt`)) delete user.password_salt;
            return user as UserInfoDto;
        }
        return user;
    }


    async getUserInfoByUserId(userId: string): Promise<UserInfoDto | null> {
        return this.getUserInfo({
            where: {
                id: userId
            }
        });
    }

    async getUserInfo(options: any = {}): Promise<UserInfoDto> {
        return await this.connection.manager.getRepository(ViewUser)
            .findOne({
                ...options,
                select: [...(options.select || []), ...this.userBaseInfoColumns],
            })
    }

    async getList(page: IPageDto<User>, options: any = {}): Promise<[any[], number]> {
        return await this.connection.manager.getRepository(ViewUser).findAndCount({
            ...options,
            select: [...(options.select || []), ...this.userBaseInfoColumns],
            take: page.pageSize,
            skip: (page.page - 1) * page.pageSize,
        });
    }

    /**
     * 修改用户信息
     * @param user 
     * @returns 
     */
    async modifyUserInfo(user: User): Promise<User> {
        if (!user.id) {
            throw new ServiceUnavailableException("参数错误");
        }
        const saveData = new User();
        saveData.id = user.id;
        if (user.avatar) saveData.avatar = user.avatar;
        if (user.email && isEmail(user.email)) saveData.email = user.email;
        if (user.mobile && isMobile(user.mobile)) saveData.email = user.email;
        if (user.password) {
            const gePasw = this.encryptPassword(user.password)
            saveData.password = gePasw.password;
            saveData.password_salt = gePasw.password_salt;
        }
        return User.save(saveData);
    }

    /**
     * 登录成功返回信息并颁发token
     */
    async genToken(user: UserInfoDto) {
        const payload = {
            sub: user.id,
            userId: user.id,
            roleId: user.role_id,
            "https://hasura.io/jwt/claims": {
                "x-hasura-allowed-roles": [user.role_name],
                "x-hasura-default-role": user.role_name,
                "x-hasura-role": user.role_name,
                "x-hasura-user-id": user.id
            }
        };
        const res: LoginRestDto = {
            userInfo: {
                ...user,
                userId: user.id,
                roleId: user.role_id,
            } as any,
            access_token: this.jwtService.sign(payload)
        };

        //缓存
        return res;
    }

    /**
     * build密码
     * @param password 
     * @returns 
     */
    encryptPassword(password: string | null, password_salt: string | null = null): PasswordDto {
        password = password || random(12);
        password_salt = password_salt || random(16);
        return {
            password: AES.encrypt(String(password), password_salt).toString(),
            password_salt
        }
    }

    /**
     * 解析token
     */
    async parseJwtToken(access_token: string) {
        return this.jwtService.verify(access_token)
    }


    /**
     * 读取相应权限的authRghts
     */
    async getAuthRightsTree(user: UserInfoDto) {
        const roleId = user.role_id
        const roleRights = user.role_rights
        const isSuperAdmin = roleRights && roleRights.indexOf(`*`) > -1
        const cache = await this.cacheManager.get(`${CACHE_KEY.AUTHRIGHTS_TREE}${roleId}`)
        if (cache) return cache;

        let where: any = {
            parent_id: IsNull()
        }

        if (!isSuperAdmin) {
            where.key = In(roleRights)
        }

        const rights = await AuthRights.find({
            where,
            order: {
                id: 'ASC'
            },
            relations: ['children']
        })

        const rightsAllowed = isSuperAdmin ? rights : rights.map((item: AuthRights) => {
            item.children = item.children.filter(e => roleRights.indexOf(e.key) > -1)
            return item
        });

        await this.cacheManager.set(`${CACHE_KEY.AUTHRIGHTS_TREE}${roleId}`, rightsAllowed, {
            ttl: 600
        })

        return rightsAllowed
    }
}
