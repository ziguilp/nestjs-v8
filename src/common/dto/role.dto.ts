import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

/**
 * 
 */
export class CreateRoleDto{
    @ApiProperty({
        description: '角色名称'
    })
    @IsNotEmpty({
        message: '角色名称不得为空'
    })
    name: string;

    @ApiProperty({
        description: '父级角色'
    })
    parent_id: number;

    @ApiProperty({
        description: '说明'
    })
    explain: string;

    @ApiProperty({
        description: '权限'
    })
    rights: string[];
}


export class UpDateRoleDto extends CreateRoleDto{
    @ApiProperty({
        description: 'ID'
    })
    @IsNotEmpty()
    id: number;
}