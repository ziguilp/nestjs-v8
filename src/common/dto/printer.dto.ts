import { ApiProperty } from "@nestjs/swagger";

/**
 * 打印机
 */
 export class printerDto{
    @ApiProperty({
        name: "name",
        description: "打印机名称"
    })
    name: string;

    @ApiProperty({
        name: "siid",
        description: "打印机识别码"
    })
    siid: string;
}



/**
 * 模板打印参数
 */
export class PrinterByTemplateBaseDto {
    /**
     * 模板
     */
    tempid?: string;

    /**
    * 打印机
    */
    siid?: string;

    /**
     * 打印纸的高度，以mm为单位
     */
    height?: number|string;

    /**
    * 打印纸的宽度，以mm为单位
    */
    width?: number|string;

    /**
     * 随机
     */
    salt?: string;

    /**
    * callBackUrl
    */
    callBackUrl?: string;

}

/**
 * SKU信息标签打印参数
 */
export class SkuInfoPrinterTemplateDto extends PrinterByTemplateBaseDto{
    /**
    * 名称
    */
    sjmc: string;

    /**
    * 条码
    */
    tm: string;

    /**
     * 价格
     */
    dj: string;

    /**
     * sku编码
     */
    bm: string;
}

/**
 * S库位标签打印参数
 */
 export class LocationPrinterTemplateDto extends PrinterByTemplateBaseDto{
    /**
    * 名称
    */
    kwmc: string;
}