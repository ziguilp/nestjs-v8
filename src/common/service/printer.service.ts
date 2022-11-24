import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import axios from "axios";
import { createHash } from "crypto";
import { prinerConfig } from "src/config";
import { LocationPrinterTemplateDto, SkuInfoPrinterTemplateDto } from "../dto/printer.dto";
import * as qs from 'qs';

/**
 * 快递100打印服务
 */
@Injectable()
export class PrinterService {

    private readonly logger = new Logger(PrinterService.name);

    /**
     * 模板
     */
    public static templates = {
        bookLabel: {
            id: 'fd999cfb18ee4a00865a90f019a7872a',
            height: '40',
            width: '60',
        },
        locationLabel: {
            id: `3ac7df68be3f4299af1ad7486b9aeaa8`,
            height: '40',
            width: '60',
        }
    };


    /**
     * 打印方法
     */
    private printMethod: string = null;

    /**
     * 打印参数
     */
    private printParam: any = null;

    /**
     * 打印书籍信息
     * @param param 
     * @returns 
     */
    async printSkuInfo(param: SkuInfoPrinterTemplateDto) {
        return this.printTemplate({
            ...param,
            callBackUrl: ``
        })
    }

    /**
     * 打印库位签
     * @param param 
     * @returns 
     */
    async printLocationLabel(param: LocationPrinterTemplateDto) {
        return this.printTemplate({
            ...param,
            callBackUrl: ``
        })
    }

    /**
     * 模板打印
     */
    async printTemplate(param: any): Promise<any> {
        this.printMethod = `printOrder`;
        this.printParam = param;
        return await this.exec();
    }

    /**
     * 文件打印
     */
    async printFile(file: string, param: any): Promise<string> {
        this.printMethod = `printOrder`;
        this.printParam = param;
        await this.exec()
        return;
    }

    /**
     * 执行自定义云打印请求
     */
    async exec() {
        try {
            const t = parseInt(String((new Date()).getTime() / 1000)) * 1000;
            const signStr = JSON.stringify(this.printParam) + t + prinerConfig.KD100_KEY + prinerConfig.KD100_SECRET;
            const sign = createHash('md5').update(signStr, 'utf8').digest('hex').toUpperCase();
            const body = {
                method: this.printMethod,
                key: prinerConfig.KD100_KEY,
                sign,
                t,
                param: JSON.stringify(this.printParam)
            };
            const res = await axios({
                url: prinerConfig.KD100_API,
                method: "POST",
                data: qs.stringify(body),
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
            });

            if (res.data.returnCode == 200) {
                return res.data.data
            }
            throw new ServiceUnavailableException(res.data.message || `请求失败`);
        } catch (error) {
            this.logger.error(error)
            throw new ServiceUnavailableException(error.message)
        }

    }

}