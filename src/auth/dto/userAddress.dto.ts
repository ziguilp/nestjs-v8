import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsNotEmpty, Length } from "class-validator";

/**
 * 创建地址
 */
export class CreateAddressDto {

    @ApiProperty({
        name: 'id',
    })
    id: number;

    @ApiProperty({
        name: 'province',
    })
    @IsNotEmpty()
    province: string;

    @ApiProperty({
        name: 'city',
    })
    @IsNotEmpty()
    city: string;

    @ApiProperty({
        name: 'area',
    })
    @IsNotEmpty()
    area: string;

    @ApiProperty({
        name: 'detail',
    })
    @IsNotEmpty()
    detail: string;

    @ApiProperty({
        name: 'name',
    })
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        name: 'mobile',
    })
    @IsNotEmpty()
    @IsMobilePhone('zh-CN')
    @Length(11, 15)
    mobile: string;
}