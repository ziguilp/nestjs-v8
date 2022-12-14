/*
 * @Author: turbo 664120459@qq.com
 * @Date: 2022-11-24 10:44:10
 * @LastEditors: turbo 664120459@qq.com
 * @LastEditTime: 2022-11-24 11:10:18
 * @FilePath: /nestjs-v8/src/test.controller.ts
 * @Description: 
 */
import { Controller, Get, Query } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { getManager } from "typeorm";
import * as RssParser from 'rss-parser';
import { Role } from "./common/entity/role.entity";
import { ContentSafe } from "./common/library/conentSafe";
import { OrderLog } from "./order/entity/orderLog.entity";
import { OrderService } from "./order/service/order.service";
import axios from "axios";

@ApiTags('测试应用')
@Controller('test')
export class TestController {

    constructor(private readonly orderService: OrderService) {

    }

    @Get('text')
    async text(@Query('text') text: string) {
        const lib = new ContentSafe()

        return lib.text(text)
    }
}