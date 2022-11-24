import { VipCard } from "src/auth/entity/vipcard.entity";
import { ViewColumn, ViewEntity } from "typeorm";
import { OrderGoodsSettleStatus, OrderGoodsStatus, OrderGoodsType } from "../dto/orderGoods.dto";
import { OrderGoods } from "../entity/orderGoods.entity";

@ViewEntity("view_order_goods", {
    expression: `
    SELECT
        og.*,
        json_agg(vs.*) as goods_info
    FROM
        "public".order_goods og
        JOIN "public".vipcard vs ON ( vs.ID = og.goods_id ) 
    WHERE
        (og.goods_type = 0 OR og.goods_type = 2) and og.date_deleted is null
    GROUP BY og.id,
        og.user_id,
        og.order_sn,
        og.merchant_id,
        og.goods_id,
        og.goods_type,
        og.goods_num,
        og.sku_id,
        og.original_price,
        og.price,
        og.total_amount,
        og.refund_amount,
        og.status,
        og.settle_amount,
        og.settle_fee,
        og.settle_status,
        og.remark,
        og.date_created,
        og.date_updated,
        og.discount,
        og.total_original_amount
        `,
    dependsOn: [OrderGoods],
    synchronize: true
})
export class ViewOrderGoods {
    @ViewColumn()
    id: number;

    @ViewColumn()
    user_id: string;

    @ViewColumn()
    order_sn: string;

    @ViewColumn()
    merchant_id: number;

    @ViewColumn()
    goods_type: OrderGoodsType;


    @ViewColumn()
    goods_id: number;

    @ViewColumn()
    goods_num: number;

    @ViewColumn()
    sku_id: number;

    @ViewColumn()
    original_price: number;

    @ViewColumn()
    price: number;

    @ViewColumn()
    discount: number;

    @ViewColumn()
    total_original_amount: number;

    @ViewColumn()
    total_amount: number;

    @ViewColumn()
    refund_amount: number;

    @ViewColumn()
    status: OrderGoodsStatus;

    @ViewColumn()
    settle_amount: number;

    @ViewColumn()
    settle_fee: number;

    @ViewColumn()
    settle_status: OrderGoodsSettleStatus;

    @ViewColumn()
    remark: string;

    @ViewColumn()
    date_created: Date;

    @ViewColumn()
    date_updated: Date;

    @ViewColumn()
    goods_info: VipCard;
}