import * as moment from "moment";
import { appConfig } from "src/config";
import { Order } from "../entity/order.entity";
import { OrderGoods } from "../entity/orderGoods.entity";

export class OrderUtil {
    /**
     * 计算订单费用
     * @param goods
     * @param ajustFee 其他费用 [分]
     */
    static calcOrderFee(goods: OrderGoods[], ajustFee?: number) {

        ajustFee = parseInt(String(ajustFee || 0));

        let res = {
            total_original_amount: 0, //总原价
            total_amount: 0,//总结算价[应付]
            total_discount: 0,//总优惠 = 总原价 - 总结算价
        };

        for (let index = 0; index < goods.length; index++) {
            const item = goods[index];
            res.total_original_amount += item.original_price;
            res.total_amount += item.total_amount;
        }

        res.total_amount += ajustFee;

        res.total_discount = res.total_original_amount - res.total_amount;

        return res
    }
}