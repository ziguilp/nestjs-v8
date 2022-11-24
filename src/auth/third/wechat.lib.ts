import { Cache } from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { cacheConfig } from 'src/config';
import * as wechatLib from 'weixin-ts-sdk';

export class WechatLib {
    public wechatMiniClient: wechatLib.MiniProgram = null;
    public wechatMpClient: wechatLib.OfficialAccount = null;

    public cache: Cache = null;

    constructor(cache?: Cache) {
        if (cache) this.cache = cache;
    }

    getCache() {
        if (!this.cache) {
            this.cache = redisStore.create({
                ...cacheConfig
            } as any) as any
        }
        return this.cache
    }

    /**
    * 获取微信小程序实例
    * @returns 
    */
    async getWechatMiniAppClient() {
        if (!this.wechatMiniClient) {
            this.wechatMiniClient = new wechatLib.MiniProgram({
                appId: process.env.WECHAT_MINIAPPID,
                secret: process.env.WECHAT_MINA_APP_SECRET,
                storage: {
                    set: async (key, value, ttl = 7000) => {
                        await this.getCache().set(key, value, { ttl });
                    },
                    get: async (key) => {
                        return await this.getCache().get(key);
                    },
                }
            })
        }
        return this.wechatMiniClient;
    }

    /**
     * 获取微信公众号实例
     * @returns 
     */
    async getWechatMpClient() {
        if (!this.wechatMpClient) {
            this.wechatMpClient = new wechatLib.OfficialAccount({
                appId: process.env.WECHAT_MP_APPID,
                secret: process.env.WECHAT_MP_SECRET,
                storage: {
                    set: async (key, value, ttl = 7000) => {
                        await this.getCache().set(key, value, { ttl });
                    },
                    get: async (key) => {
                        return await this.getCache().get(key);
                    },
                }
            })
        }
        return this.wechatMpClient;
    }
}