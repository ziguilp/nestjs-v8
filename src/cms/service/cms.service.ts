import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { isNotEmpty } from "class-validator";
import { Request } from "express";
import { isEmpty } from "lodash";
import { CmsContent } from "../entity/cmsContent.entity";

@Injectable()
export class CmsService {
    constructor(@Inject(REQUEST) private readonly req: Request) {

    }

    /**
     * 新增内容
     */
    async saveConent(data: CmsContent) {

        if (isEmpty(data.content) && isEmpty(data.image)) {
            throw new ServiceUnavailableException(`内容和配图不得同时为空`)
        }

        if (isNotEmpty(data.alias)) {
            const exist = await CmsContent.createQueryBuilder().where({
                alias: data.alias
            }).getOne()

            if (exist && exist.id != data.id) {
                throw new ServiceUnavailableException(`别名已被使用`)
            }
        }

        data.user_created = this.req.user.id;

        return await CmsContent.save(data)
    }
}