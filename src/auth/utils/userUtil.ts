import { Logger, ServiceUnavailableException } from "@nestjs/common";
import _ from "lodash";
import * as moment from "moment";
import { DepositAmountLogTypeDto, VipSubscribeLogType } from "src/common/dto/user.dto";
import { User } from "src/common/entity/user.entity";
import { UserThirdAuth } from "src/common/entity/userThirdAuth.entity";
import { EntityManager } from "typeorm";
import { DepositAmountLog } from "../entity/deposit_amount_log.entity";
import { UserAddress } from "../entity/userAddress.entity";
import { vipSUbscribeLog } from "../entity/vipsubscribe.entity";
import { ThirdPlatformDto } from "../third/third.dto";

/**
 * 会员类
 */
export class UserUtil {

    private static logger = new Logger(UserUtil.name);

    /**
     * 增加会员时间
     * @param userId
     * @param interval 增加时间秒
     * @param orderSn
     * @param type
     * @param remark
     */
    static async addVipInterval(manager: EntityManager, userId: string, interval: number, orderSn: string, type: VipSubscribeLogType, remark?: string) {
        const user = await manager.getRepository(User).findOne({
            id: userId
        });

        if (!user) {
            throw new ServiceUnavailableException("用户不合法");
        }

        const is_vip = user.vip_expire_time ? moment().isBefore(moment(user.vip_expire_time)) : false;

        user.vip_expire_time = (is_vip ? moment(user.vip_expire_time).add(interval, 's') : moment().add(interval, 's')).toDate();

        await manager.save(user)

        await manager.save(vipSUbscribeLog.create({
            user_id: user.id,
            order_order_sn: orderSn,
            type,
            interval,
            remark
        }))
        return true
    }

    /**
     * 余额变更
     * @param amount 有正负值，交押金为正，扣减为负
     */
    static async changeDepositAmount(manager: EntityManager, userId: string, type: DepositAmountLogTypeDto, amount: number, orderSn?: string, remark?: string) {

        amount = parseInt(amount + ``);

        if (type == DepositAmountLogTypeDto.PLUS && amount < 0) {
            throw new ServiceUnavailableException("变更额有误");
        }

        if ((DepositAmountLogTypeDto.MINUS == type || DepositAmountLogTypeDto.CONSUME == type) && amount > 0) {
            amount = 0 - amount;
        }

        const user = await manager.getRepository(User).findOne({
            id: userId,
        });

        if (!user) {
            throw new ServiceUnavailableException("用户不合法");
        }

        const userDepositAmount = user.deposit_amount + amount;

        if (userDepositAmount < 0) {
            throw new ServiceUnavailableException("余额不足");
        }

        const log = await manager.save(DepositAmountLog.create({
            user_id: user.id,
            order_sn: orderSn || null,
            type,
            before_amount: user.deposit_amount,
            amount,
            after_amount: userDepositAmount,
            remark: remark || ''
        }));



        if (!log) {
            throw new ServiceUnavailableException("变更失败:01");
        }

        user.deposit_amount = userDepositAmount;

        await manager.save(user);

        return true;
    }


    /**
     * 获取用户的押金可用余额：押金总余额 - 在借图书额
     */
    static async getUserDepositAmountReal(userId: string) {
        const balance = await User.getRepository().manager.query(`WITH b as (
            (SELECT
            user_id,
            sum(deposit) as deposit_useing
            FROM public.order_goods
            WHERE status = 2
            GROUP BY user_id) 
        )
        SELECT
        users.id as user_id,
        users.deposit_amount,
        COALESCE(b.deposit_useing, 0) as deposit_useing
        FROM public.users
        LEFT JOIN b ON (b.user_id = users.id)
        WHERE users.id = $1
        `, [userId])

        UserUtil.logger.log('=====用户可用押金余额=====', balance)

        const res = balance && balance.length > 0 ? balance[0] : null;

        if (!res) {
            throw new ServiceUnavailableException("账户信息异常:01");
        }

        return {
            user_id: res.user_id,
            deposit_useing: parseInt(res.deposit_useing),
            deposit_amount: res.deposit_amount,
            deposit_remain: (res.deposit_amount) - parseInt(res.deposit_useing)
        }
    }


    /**
     * 根据userId和platform获取授权信息，不存在的则写入
     * @param user 
     * @returns 
     */
    static async getThirdInfo(user_id: string, platform: ThirdPlatformDto): Promise<UserThirdAuth> {
        const thirdInfo = await UserThirdAuth.findOne({
            third_platform: platform,
            user_id: user_id
        })

        return thirdInfo
    }

    /**
     * 通过手机号查询用户ID
     */
    static async getUserIdsByMobile(mobile: string) {
        const user_ids = (await User.createQueryBuilder().where({
            mobile: mobile
        }).getMany()).map(e => e.id)

        const address_user_ids = (await UserAddress.createQueryBuilder().where({
            mobile: mobile
        }).getMany()).map(e => e.user_id)

        return _.uniq(user_ids.concat(address_user_ids))
    }

}