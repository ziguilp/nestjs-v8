import random from 'string-random';
import * as moment from 'moment';
import { isEmpty } from 'class-validator';
import { AppPlatform } from 'src/common/dto/appVersion.dto';

/**
 * 是否中国大陆手机号
 */
export const isMobile = (str: string | number): boolean => {
    return /^1[3|4|5|6|7|8|9](\d{9})$/.test(String(str))
}


/**
 * 是否ISBN
 */
export const isISBN = (str: string): boolean => {
    return /^97([\d]{11})*$/i.test(str)
}


/**
 * 是否SKU编码
 * @param string 
 * @returns 
 */
export const isSkuNo = (str: string) => {
    return /^[A-Z]([\d]+)$/i.test(str)
}

/**
 * 从字符串中取得SKU码
 * @param str 
 * @returns 
 */
export const getSkuNo = (str: string) => {
    if (isSkuNo(str)) {
        return str.toUpperCase()
    }
    return /.*?\/([A-Z][\d]+)$/i.test(str) ? (str.replace(/.*?\/([A-Z][\d]+)$/i, '$1')).toUpperCase() : '';
}

/**
 * 是否库位码
 * @param string 
 * @returns 
 */
export const isLocation = (str: string) => {
    str = (str || '').toUpperCase()
    return /^LOC([\d]+)\_(.*?)$/i.test(str)
}


/**
 * 根据库位码得到libraryid
 * @param string 
 * @returns 
 */
export const getLibraryIdByLocation = (str: string) => {
    str = (str || '').toUpperCase()
    const ma = str.match(/^LOC([\d]+)\_(.*?)$/i)
    return parseInt(ma ? ma[1] : '0');
}


/**
 * 下划线转换驼峰
 * @param string 
 * @returns 
 */
export const toHump = (string: string) => {
    return string.replace(/\_(\w)/g, function (all, letter) {
        return letter.toUpperCase();
    });
}

/**
 * 驼峰转换下划线
 * @param string 
 * @returns 
 */
export const toLine = (string: string) => {
    return string.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**
 * 订单号生成
 */
export const generateOrderNo = () => {
    return (moment().utcOffset("+08").format("YYYYMMDDHHmmss") + random(6)).toUpperCase();
}

/**
 * Object-key
 */
export const hasKey = (obj: Object, key: string): boolean => {
    return obj ? Object.hasOwnProperty.call(obj, key) : false;
}

/**
 * 分转元
 */
export const fen2Yuan = (fen: number) => {
    return Number(Number(fen / 100).toFixed(2))
}

/**
 * 元转分
 */
export const Yuan2Fen = (yuan: number) => {
    return Number(Number(yuan * 100).toFixed(0))
}

export const getDeviceType = (headers: any) => {

    let agent = '';
    if (hasKey(headers, 'user-agent')) {
        agent = String(headers['user-agent'] || '').toLowerCase();
    } else if (hasKey(headers, 'USER_AGENT')) {
        agent = String(headers['USER_AGENT'] || '').toLowerCase();
    }

    if (agent.indexOf('iphone') > -1 ||
        agent.indexOf('ipad') > -1 ||
        agent.indexOf('ipod') > -1) {
        return AppPlatform.IOS
    }

    if (agent.indexOf('android') > -1) {
        return AppPlatform.ANDROID
    }

    return AppPlatform.UNKNOWN
}