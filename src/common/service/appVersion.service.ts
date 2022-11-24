import { CACHE_MANAGER, Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { isEmpty } from "lodash";
import { CACHE_KEY } from "src/constants";
import { MoreThan } from "typeorm";
import { AppPlatform, AppVersionStatus } from "../dto/appVersion.dto";
import { AppVersion } from "../entity/appVersion.entity";
import { appVersionCompaire, calcVersionVal } from "../validators/version.validator";

@Injectable()
export class AppVersionService {

    constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {

    }

    /**
     * 新增版本
     */
    async saveVersion(data: AppVersion) {
        const lastVersion = await AppVersion.createQueryBuilder().where({
            platform: data.platform
        }).orderBy({
            id: 'DESC'
        }).getOne()

        if (lastVersion) {
            data.version_val = calcVersionVal(data.version)
            if (data.version_val <= lastVersion.version_val) {
                throw new ServiceUnavailableException(`新增版本号太小了`)
            }
        }

        if (isEmpty(data.old_versions) || data.old_versions.length === 0) {
            data.old_versions = []
        }

        return await AppVersion.save(data)

    }

    /**
     * 根据版本号，检查是否有版本更新
     * 
     */
    async getNewestVersion(platform: AppPlatform, version: string) {
        const versionVal = calcVersionVal(version)

        const key = `${CACHE_KEY.APPVERSION_CACHE}${platform}:${versionVal}`
        const cache = await this.cache.get(key)

        if (typeof cache != 'undefined') {
            return cache
        }
        const ver = await AppVersion.createQueryBuilder().where({
            status: AppVersionStatus.PUBLISH,
            platform,
            version_val: MoreThan(versionVal)
        })
            .orderBy({
                version_val: 'DESC'
            })
            .getOne()
        await this.cache.set(key, ver || null, {
            ttl: 3600
        })
        return ver
    }
}