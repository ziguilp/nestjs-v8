import { CACHE_MANAGER, Get, Inject, Param, Post, Query, Req, ServiceUnavailableException } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { isEmpty, isMobilePhone, isNotEmpty, isUUID } from 'class-validator';
import { Request } from 'express';
import * as moment from 'moment';
import { UserUtil } from 'src/auth/utils/userUtil';
import { RequestLock } from 'src/common/decorator/request-lock';
import { IPageDto, IPageResDto } from 'src/common/dto/base.dto';
import { RoleName } from 'src/constants';
import { isMobile } from 'src/utils/util';
import { Connection, getConnection, getConnectionManager, ILike, In, Repository } from 'typeorm';
import { ApplyRefundDto, CreateOrderDto } from '../dto/order.dto';
import { Order } from '../entity/order.entity';
import { OrderGoods } from '../entity/orderGoods.entity';
import { OrderLog } from '../entity/orderLog.entity';
import { OrderService } from '../service/order.service';
import { ViewOrderList } from '../viewentity/viewOrderList.entity';


@ApiTags("订单模块")
@Controller('order')
export class OrderController {

    private orderRepository: Repository<Order>;
    private orderGoodsRepository: Repository<OrderGoods>;

    constructor(private readonly orderService: OrderService, private readonly connection: Connection, @Inject(CACHE_MANAGER) private cache: Cache) {
        this.orderRepository = connection.getRepository(Order);
        this.orderGoodsRepository = connection.getRepository(OrderGoods);
    }

    /**
     * 订单创建
     * @param createOrderDto 
     * @returns 
     */
    @ApiBearerAuth()
    @ApiBody({
        type: CreateOrderDto
    })
    @ApiOperation({
        summary: '订单创建'
    })
    @RequestLock({
        key: 'create_order',
        expiresIn: 10
    })
    @Post('createOrder')
    async createOrder(@Req() req: Request, @Body() createOrderDto: CreateOrderDto) {
        return await this.orderService.createOrder(req.user, createOrderDto)
    }

    /**
     * 订单取消
     * @param orderSn 
     * @returns 
     */
    @ApiOperation({
        summary: '订单取消'
    })
    @ApiBearerAuth()
    @ApiParam({
        name: "orderSn",
    })
    @RequestLock({
        key: (req: Request) => {
            return `cancel_order_${req.params.orderSn}`
        },
        expiresIn: 10
    })
    @Post('/cancel/:orderSn')
    async cancel(@Param("orderSn") orderSn: string) {
        return await this.orderService.cancelOrder(orderSn);
    }

    /**
     * 申请退款
     * @param orderSn 
     * @returns 
     */
    @ApiOperation({
        summary: '申请退款'
    })
    @ApiBody({
        type: ApplyRefundDto
    })
    @RequestLock({
        key: (req: Request) => {
            return `refund_ordergoods_${req.body.orderGoodsId}`
        },
        expiresIn: 10
    })
    @ApiBearerAuth()
    @Post('/applyRefund')
    async applyRefund(@Body() data: ApplyRefundDto) {
        return await this.orderService.applyRefund(data)
    }



    @ApiOperation({ summary: "订单列表" })
    @ApiBearerAuth()
    @ApiOperation({
        summary: '订单列表'
    })
    @ApiQuery({
        type: IPageDto
    })
    @Get("list")
    async list(@Req() req: Request, @Query() query: IPageDto<ViewOrderList>) {

        const page = Number(query.page || 1);
        const pageSize = Number(query.pageSize || 10);

        const db = this.connection.manager.getRepository(ViewOrderList).createQueryBuilder();


        if (req.user.role_name === RoleName.USER) {
            db.andWhere({
                user_id: req.user.id
            })
        }


        if (isNotEmpty(query.data.user_id) && isUUID(query.data.user_id)) {
            db.andWhere({
                user_id: query.data.user_id
            })
        }


        if (isNotEmpty(query.data.order_type)) {
            db.andWhere({
                order_type: query.data.order_type
            })
        }

        if (isNotEmpty(query.data.order_sn)) {
            db.andWhere({
                order_sn: query.data.order_sn
            })
        }

        if (isNotEmpty(query.data.status)) {
            db.andWhere({
                status: query.data.status
            })
        }




        if (isNotEmpty((query.data as any).mobile) && isMobile((query.data as any).mobile)) {

            let user_ids = await UserUtil.getUserIdsByMobile((query.data as any).mobile)

            if (user_ids.length == 0) {
                return {
                    list: [],
                    total: 0,
                    currentPage: 1,
                } as IPageResDto<ViewOrderList>
            }

            db.andWhere({
                user_id: In(user_ids)
            })
        }

        const [list, total] = await db.orderBy({
            id: 'DESC'
        }).take(pageSize)
            .skip((page - 1) * pageSize)
            .getManyAndCount();

        return {
            list,
            total,
            currentPage: page,
        } as IPageResDto<ViewOrderList>;
    }

    @ApiOperation({
        summary: '订单详情',
    })
    @ApiParam({
        name: "orderSn",
        description: "订单号",
    })
    @ApiBearerAuth()
    @Get("/detail/:orderSn")
    async detail(@Req() req: Request, @Param("orderSn") orderSn: string) {

        const res = await this.connection.manager.getRepository(ViewOrderList).findOne({ order_sn: orderSn })

        if (res && req.user.role_name === RoleName.USER && req.user.id != res.user_id) {
            throw new ServiceUnavailableException(`未找到订单`)
        }

        // 读取订单日志
        if (res) {
            const orderLog = await OrderLog.find({
                where: {
                    order_sn: res.order_sn
                }
            })

            if (orderLog) {
                res['orderLog'] = orderLog.reduce((p: any, c: OrderLog) => {
                    const time = moment(c.date_created).format("YYYY-MM-DD HH:mm:ss")
                    if (!p[time]) {
                        p[time] = c.operation
                    }
                    return p
                }, {})
            }
        }

        return res
    }
}
