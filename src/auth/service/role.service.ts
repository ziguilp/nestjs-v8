import { Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { CreateRoleDto, UpDateRoleDto } from "src/common/dto/role.dto";
import { Role } from "src/common/entity/role.entity";
import { getManager, Not } from "typeorm";

/**
 * 角色
 */
@Injectable()
export class RoleService {


    constructor() {
    }

    /**
     * 新增角色
     */
    async create(data: CreateRoleDto) {
        return await getManager().transaction(async (manager) => {
            //校验
            const role = await Role.findOne({
                where: {
                    name: data.name
                }
            });

            if (role) {
                throw new ServiceUnavailableException(`角色[${data.name}]已经存在`)
            }

            const newRole = await manager.getRepository(Role).save(Role.create(data))
            return newRole
        })


    }


    /**
     * 更新角色
     */
    async update(data: UpDateRoleDto) {

        return getManager().transaction(async (manager) => {
            //校验
            const role = await Role.findOne({
                where: {
                    name: data.name,
                    id: Not(data.id)
                }
            });

            if (role) {
                throw new ServiceUnavailableException(`角色[${data.name}]已经存在`)
            }

            const roleUp = await manager.getRepository(Role).save(Role.create(data))
            return roleUp
        })
    }

    async delete(id: number) {
        const role = await Role.findOne(+id)
        if (!role) {
            throw new NotFoundException("不存在")
        }
        if (role.rights.indexOf('*') > -1) {
            throw new ServiceUnavailableException("禁止删除")
        }
        await role.softRemove()
        return true
    }
}