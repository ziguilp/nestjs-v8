/**
 * JWT secret
 */
export const JWT_SECRET = 'K2GEF3r1JmztdBZwIe6ue9en7jUcNERTHvYiAOSfgsblXDpWQCakRot5V0MLqy4h8xPRk';


/**
 * JWT expireTime
 */
export const JWT_EXPIRETIME = '2h';


/**
 * 缓存键
 */
export const CACHE_KEY = {
    /**
     * token
     */
    TOKEN: `${process.env.PROJECT_NAME || 'turbo'}:token:`,
    /**
     * 验证码
     */
    CAPTCHA: `${process.env.PROJECT_NAME || 'turbo'}:captcha:`,
    /**
     * 验证码
     */
    CAPTCHA_LIMIT: `${process.env.PROJECT_NAME || 'turbo'}:captchalimit:`,
    /**
     * 验证码
     */
    AUTHRIGHTS_TREE: `${process.env.PROJECT_NAME || 'turbo'}:auth_rights:`,
    /**
     * 版本
     */
    APPVERSION_CACHE: `${process.env.PROJECT_NAME || 'turbo'}:app_version:`,
    /**
     * OSS-token
     */
    OSS_TOKEN: `${process.env.PROJECT_NAME || 'turbo'}:oss_token:`,
}

/**
 * 角色名称
 */
export const RoleName = {
    /**
     * 超级管理员
     */
    SUPERADMIN: 'superadmin',
    /**
     * 普通用户
     */
    USER: 'user',
}

export const RoleId = {
    /**
     * 超级管理员
     */
    SUPERADMIN: 1,
    /**
     * 普通用户
     */
    USER: 2,
}