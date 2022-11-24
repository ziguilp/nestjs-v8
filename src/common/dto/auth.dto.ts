import { ApiProperty } from "@nestjs/swagger";
import { Allow, IsEmail, IsIn, IsMobilePhone, IsOptional } from "class-validator";
import { Role } from "src/common/entity/role.entity";

/**
 * 登录后返回的信息
 */
export interface LoginRestDto {
    userInfo: UserInfoDto,
    access_token: string
}

/**
 * 用户状态
 */
export enum UserStatusDto {
    /**
     * 正常
     */
    NORMAL = "normal",
    /**
     * 锁定，不可登录
     */
    LOCKED = "locked"
}

/**
 * 用户基本信息
 */
export class UserBaseInfoDto {

    @ApiProperty({
        name: 'id',
        default: '',
        description: '用户ID'
    })
    id: string

    @ApiProperty({
        name: 'nickname',
        default: '',
        description: '用户昵称'
    })
    nickname: string

    @ApiProperty({
        name: 'mobile',
        default: '',
        description: '手机号'
    })
    @IsMobilePhone('zh-CN')
    @IsOptional()
    mobile: string

    @ApiProperty({
        name: 'email',
        default: '',
        description: '邮箱地址'
    })
    @IsEmail({
        skipNullProperties: true,
        skipUndefinedProperties: true,
    })
    @IsOptional()
    email: string

    @ApiProperty({
        name: 'avatar',
        default: '',
        description: '头像'
    })
    avatar: string

    @ApiProperty({
        name: 'role_id',
        default: '',
        description: '角色ID'
    })
    role_id: number

    @ApiProperty({
        name: 'status',
        default: '',
        description: '状态'
    })
    @IsOptional()
    @IsIn(Object.values(UserStatusDto))
    status: UserStatusDto

    @ApiProperty({
        description: "生日"
    })
    birthday: Date

    @ApiProperty({
        description: "简介"
    })
    intro: string

    @ApiProperty({
        description: "常住城市",
        nullable: true,
    })
    location: string;
}

/**
 * 用户个人输出信息
 */
export class UserInfoDto extends UserBaseInfoDto {
    @ApiProperty({
        name: 'role_name',
        default: '',
        description: '角色名称'
    })
    role_name: string

    @ApiProperty({
        name: 'role_rights',
        default: '',
        description: '角色权限'
    })
    role_rights: string[] | null


    @ApiProperty({
        name: 'role_date_deleted',
        default: '',
        description: '角色删除'
    })
    role_date_deleted: Date | null
}


export class PasswordDto {
    @ApiProperty({
        name: 'password',
        default: '',
        description: '密码'
    })
    password: string

    @ApiProperty({
        name: 'password_salt',
        default: '',
        description: '密码盐'
    })
    password_salt: string
}

/**
 * 用户个人输出信息带密码
 */
export class UserInfoWithPasswordDto extends UserInfoDto {
    @ApiProperty({
        name: 'password',
        default: '',
        description: '密码'
    })
    password: string

    @ApiProperty({
        name: 'password_salt',
        default: '',
        description: '密码盐'
    })
    password_salt: string
}

/**
 * 用户注册
 */
export class RegDto {

    @ApiProperty({
        name: 'nickname',
        default: '',
        description: '用户昵称'
    })
    nickname: string

    @ApiProperty({
        name: 'mobile',
        default: '',
        description: '手机号'
    })
    @IsMobilePhone('zh-CN')
    @IsOptional()
    mobile: string

    @ApiProperty({
        name: 'email',
        default: '',
        description: '邮箱地址'
    })
    @IsEmail({
        skipNullProperties: true,
        skipUndefinedProperties: true,
    })
    @IsOptional()
    email: string

    @ApiProperty({
        name: 'avatar',
        default: '',
        description: '头像'
    })
    avatar: string

    @ApiProperty({
        name: 'role_id',
        default: '',
        description: '角色ID'
    })
    role_id: number

    @ApiProperty({
        name: 'status',
        default: '',
        description: '状态'
    })
    @IsIn(Object.values(UserStatusDto))
    status: UserStatusDto

    @ApiProperty({
        name: 'password',
        default: '',
        description: '密码'
    })
    password: string
}



/**
 * 用户登录
 */
export class LoginDto {
    @ApiProperty({
        name: 'username',
        default: '',
        description: '用户名[手机号/邮箱地址]'
    })
    username: string

    @ApiProperty({
        name: 'password',
        default: '',
        description: '密码'
    })
    password: string
}

/**
 * 菜单
 */
export class AdminMenuDto {
    @ApiProperty({
        name: 'name',
        default: '',
        description: '名称'
    })
    name: string

    @ApiProperty({
        name: 'parent_id',
        default: '',
        description: '父级菜单'
    })
    parent_id: number

    @ApiProperty({
        name: 'link',
        default: '',
        description: '路由'
    })
    link: string
}

/**
 * 密码修改
 */
export class ModifyPasswordDto {

    @ApiProperty({
        name: 'role',
        default: '',
        description: '用户角色'
    })
    role: string

    @ApiProperty({
        name: 'username',
        default: '',
        description: '用户名(邮箱或者手机号)'
    })
    username: string

    @ApiProperty({
        name: 'old_password',
        default: '',
        description: '旧密码'
    })
    old_password: string

    @ApiProperty({
        name: 'new_password',
        default: '',
        description: '新密码'
    })
    new_password: string


    @ApiProperty({
        name: 'captcha',
        default: '',
        description: '短信验证码'
    })
    captcha: string
}