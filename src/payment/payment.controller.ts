import { All, Body, Controller, Get, HttpCode, Logger, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Rights } from 'src/common/decorator/rights';
import { OrderGoods } from 'src/order/entity/orderGoods.entity';
import { TradeClient, TradeWay, WechatPayOrderDto } from './dto/pay.dto';
import { RefundApplyDto } from './dto/refund.dto';
import { Payment } from './entity/payment.entity';
import { PaymentService } from './service/payment.service';

@ApiTags('支付模块')
@Controller('payment')
export class PaymentController {

    private logger: Logger = new Logger(PaymentController.name)

    constructor(private readonly payService: PaymentService) {

    };

    /**
     * 支付发起
     */
    @ApiOperation({
        summary: '发起支付'
    })
    @ApiBody({
        type: WechatPayOrderDto
    })
    @ApiParam({
        name: 'orderSn',
        description: '订单号',
        type: String,
    })
    @ApiParam({
        name: 'tradeway',
        description: '支付方式',
        type: String,
        enum: TradeWay
    })
    @ApiParam({
        name: 'client',
        description: '支付客户端',
        type: String,
        enum: TradeClient
    })
    @Post("/pay/:orderSn/:tradeway/:client")
    async pay(@Param("orderSn") orderSn: string, @Param("tradeway") tradeway: TradeWay, @Param("client") client: TradeClient) {

        return await this.payService.createPay(orderSn, tradeway, client);
    }


    /**
     * 支付回调
     * 
     */
    @ApiParam({
        name: 'platform',
        enum: TradeWay
    })
    @HttpCode(200)
    @Post("/notify/:platform")
    async notify(@Param("platform") platform: TradeWay, @Req() req: Request, @Body() body) {
        this.logger.log('支付回调[body]', platform, body)
        return await this.payService.verify(platform, body)
    }

    /**
     * 支付查询
     */
    @ApiParam({
        name: "orderSn",
        description: "订单号"
    })
    @ApiBearerAuth()
    @Get("query/:orderSn")
    async query(@Param("orderSn") orderSn: string) {
        return await Payment.findOne({
            order_order_sn: orderSn
        })
    }

}
