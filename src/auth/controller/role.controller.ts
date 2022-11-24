import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiTags } from "@nestjs/swagger";
import { Rights } from "src/common/decorator/rights";
import { IPageResDto } from "src/common/dto/base.dto";
import { CreateRoleDto, UpDateRoleDto } from "src/common/dto/role.dto";
import { Role } from "src/common/entity/role.entity";
import { RoleService } from "../service/role.service";

@ApiTags('角色模块')
@Controller("/role")
export class RoleController {

    constructor(private readonly roleService: RoleService) { }


    @ApiOperation({
        summary: '读取角色列表',
        description: '读取角色列表',
    })
    @ApiBearerAuth()
    @Rights('read_role_list')
    @Get('/list')
    async getList() {
        const [list, count] = await Role.findAndCount()
        return {
            pageSize: count,
            currentPage: 1,
            total: count,
            list
        } as IPageResDto<Role>
    }


    @ApiOperation({
        summary: '添加角色',
    })
    @ApiBearerAuth()
    @Rights('add_role')
    @ApiBody({
        type: CreateRoleDto
    })
    @Post('/create')
    async create(@Body() data: CreateRoleDto) {
        return await this.roleService.create(data)
    }

    @ApiOperation({
        summary: '修改角色',
    })
    @ApiBearerAuth()
    @Rights('update_role')
    @ApiBody({
        type: UpDateRoleDto
    })
    @Post('/update')
    async update(@Body() data: UpDateRoleDto) {
        return await this.roleService.update(data)
    }


    @ApiOperation({
        summary: '删除角色',
    })
    @ApiBearerAuth()
    @Rights('delete_role')
    @Post('/delete/:id')
    async delete(@Param('id') id: number) {
        return await this.roleService.delete(id)
    }
}