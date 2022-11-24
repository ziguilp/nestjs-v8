/*
 * @Author        : turbo 664120459@qq.com
 * @Date          : 2022-11-24 10:44:10
 * @LastEditors   : turbo 664120459@qq.com
 * @LastEditTime  : 2022-11-24 12:35:11
 * @FilePath      : /nestjs-v8/src/auth/auth.module.ts
 * @Description   : 
 * 
 * Copyright (c) 2022 by turbo 664120459@qq.com, All Rights Reserved. 
 */
import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JWT_EXPIRETIME, JWT_SECRET } from 'src/constants';
import { RoleService } from './service/role.service';
import { RoleController } from './controller/role.controller';
import { thirdLoginController } from './third/login.controller';
import { ThirdLoginService } from './third/login.service';
import { UserController } from './controller/user.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
    imports: [
        CommonModule,
        JwtModule.register({
            secret: JWT_SECRET,
            signOptions: { expiresIn: JWT_EXPIRETIME },
        })
    ],
    controllers: [AuthController, RoleController, thirdLoginController, UserController],
    providers: [AuthService, RoleService, ThirdLoginService],
    exports: [AuthService, ThirdLoginService]
})
export class AuthModule {
    constructor() { }
}
