import { OrderDelivery } from "src/logistic/entity/logistic.entity";
import { ViewColumn, ViewEntity } from "typeorm";
import { OrderStatus, OrderType } from "../dto/order.dto";
import { Order } from "../entity/order.entity";
import { OrderGoods } from "../entity/orderGoods.entity";
import { ViewOrderGoods } from "./viewOrderGoods.entity";

@ViewEntity("view_order_list", {
    expression: `
    SELECT
    o.*,
    json_agg(vog.*) as order_goods,
    json_agg(od.*) as order_delivery
    FROM "public"."order" o 
    LEFT JOIN "public".view_order_goods vog ON (vog.order_sn = o.order_sn) 
    LEFT JOIN "public".order_delivery od ON (od.order_sn = o.order_sn and od.date_deleted is null)
    WHERE o.date_deleted is null
    GROUP BY o.id,
    o.user_id,
    o.merchant_id,
    o.order_sn,
    o.status,
    o.order_type,
    o.total_original_amount,
    o.total_amount,
    o.trade_title,
    o.remark,
    o.date_created,
    o.date_updated
`,
    dependsOn: [Order, ViewOrderGoods, OrderGoods],
    synchronize: true
})
export class ViewOrderList {
    @ViewColumn()
    id: number;

    @ViewColumn()
    user_id: string;

    @ViewColumn()
    order_sn: string;

    @ViewColumn()
    status: OrderStatus;

    @ViewColumn()
    order_type: OrderType;

    @ViewColumn()
    merchant_id: number;

    @ViewColumn()
    total_original_amount: number;

    @ViewColumn()
    total_amount: number;

    @ViewColumn()
    trade_title: string;

    @ViewColumn()
    remark: string;

    @ViewColumn()
    order_goods: ViewOrderGoods[];

    @ViewColumn()
    order_delivery: OrderDelivery[];
}