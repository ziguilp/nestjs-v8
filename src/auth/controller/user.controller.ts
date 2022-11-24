import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { RequestLock } from "src/common/decorator/request-lock";
import { CreateAddressDto } from "src/auth/dto/userAddress.dto";
import { UserAddress } from "src/auth/entity/userAddress.entity";

@ApiTags('用户附加功能模块')
@Controller("/userext")
export class UserController {
    constructor() { }

    @ApiOperation({
        summary: `添加、修改地址`
    })
    @ApiBody({
        type: CreateAddressDto
    })
    @RequestLock({
        key: 'create_user_address',
        expiresIn: 5
    })
    @ApiBearerAuth()
    @Post('address/create')
    async createAddress(@Req() req: Request, @Body() data: CreateAddressDto) {

        // 收货地址唯一
        const exist = await UserAddress.findOne({
            user_id: req.user.id,
        })

        if (exist) {
            exist.province = data.province;
            exist.city = data.city;
            exist.area = data.area;
            exist.detail = data.detail;
            exist.mobile = data.mobile;
            exist.name = data.name;
            return await exist.save()
        } else {
            return await UserAddress.save(UserAddress.create({
                ...data,
                user_id: req.user.id
            }))
        }


        // if (data.id) {
        //     const exist = await UserAddress.findOne(data.id)
        //     if (exist && exist.user_id === req.user.id) {
        //         return await UserAddress.save(UserAddress.create({
        //             ...data,
        //             user_id: req.user.id
        //         }))
        //     } else {
        //         delete data.id
        //     }
        // } else {

        //     const exist = await UserAddress.findOne({
        //         user_id: req.user.id,
        //         province: data.province,
        //         detail: data.detail,
        //         mobile: data.mobile,
        //     })

        //     if (exist && exist.user_id === req.user.id) {
        //         return await UserAddress.save(UserAddress.create({
        //             ...data
        //         }))
        //     }
        // }

        // return await UserAddress.save(UserAddress.create({
        //     ...data,
        //     user_id: req.user.id
        // }))
    }

    /**
     * 读取地址列表
     */
    @ApiOperation({
        summary: `读取地址列表`
    })
    @ApiBearerAuth()
    @Get('address/list')
    async getAddress(@Req() req: Request) {
        return UserAddress.find({
            where: {
                user_id: req.user.id
            }
        })
    }
}