import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { Cache } from 'cache-manager';
import { AuthRights } from './common/entity/authRights.entity';
import { Role } from './common/entity/role.entity';
import { CACHE_KEY } from './constants';

@Injectable()
export class AppService {

    private readonly logger = new Logger(AppService.name);

    constructor(private readonly discoveryService: DiscoveryService, private readonly metadataScanner: MetadataScanner, @Inject(CACHE_MANAGER) private readonly cache: Cache) { };


    /**
     * 权限注解扫描
     */
    async scan(flush: boolean = false) {

        if (flush === true) {
            //删除旧的
            await AuthRights.clear();
        }

        const controllers = this.discoveryService.getControllers();

        const ctls = controllers
            // .filter(wrapper => wrapper.isDependencyTreeStatic())
            .filter(wrapper => wrapper.instance);

        for (let index = 0; index < ctls.length; index++) {
            const wrapper: InstanceWrapper = ctls[index];
            const { instance } = wrapper;
            const prototype = Object.getPrototypeOf(instance);

            this.logger.log(`==ctl==`, Reflect.getMetadata('swagger/apiUseTags', instance.constructor))

            //保存控制器权限
            const ctlTags: string[] = Reflect.getMetadata('swagger/apiUseTags', instance.constructor)
            const cname = ctlTags && ctlTags.length > 0 ? ctlTags[0] : instance.constructor.name
            const ctlAuthRight = await this.saveAuthRight(`attach_${instance.constructor.name}`, cname, instance.constructor.name)

            this.metadataScanner.scanFromPrototype(
                instance,
                prototype,
                async (methodKey: string) => {

                    this.logger.log(`${instance.constructor.name}.${methodKey}`, instance[methodKey])
                    //权限关键字
                    const rightsKey = Reflect.getMetadata('rights', instance[methodKey]);

                    if (!rightsKey) {
                        return;
                    }

                    // 接口名称
                    const apiName = Reflect.getMetadata('swagger/apiOperation', instance[methodKey]);

                    return await this.saveAuthRight(rightsKey, apiName ? (apiName.summary || apiName.description) : ``, `${instance.constructor.name}.${methodKey}`, ctlAuthRight)
                }
            );
        }
        const roles = await Role.find()
        for (let index = 0; index < roles.length; index++) {
            const role = roles[index];
            await this.cache.del(`${CACHE_KEY.AUTHRIGHTS_TREE}${role.id}`)
        }
        return true;
    }


    protected async saveAuthRight(key: string, name: string, path: string, parent?: AuthRights) {
        //增量模式
        const exist = await AuthRights.findOne({
            key,
        })

        if (exist) {
            exist.name = name;
            exist.path = path;
            exist.parent = parent;
            exist.save()
            return exist;
        }

        return await AuthRights.save(AuthRights.create({
            key,
            name,
            path,
            parent
        }))
    }

}
