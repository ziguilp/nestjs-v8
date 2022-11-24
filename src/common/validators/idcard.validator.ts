import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsChinaIdCard(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsChinaIdCard',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (!value || typeof value !== 'string') {
                        return false
                    }
                    if (!/(^\d{15}$)|(^\d{17}(\d|X|x)$)/.test(value)) {
                        // console.log('你输入的身份证长度或格式错误')
                        return false
                    }
                    //身份证城市
                    let aCity = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外" };
                    if (!aCity[parseInt(value.slice(0, 2))]) {
                        // console.log('你的身份证地区非法')
                        return false
                    }
                    // 出生日期验证
                    let sBirthday = (value.slice(6, 10) + "-" + Number(value.slice(10, 12)) + "-" + Number(value.slice(12, 14))).replace(/-/g, "/"),
                        d = new Date(sBirthday)
                    if (sBirthday != (d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate())) {
                        // console.log('身份证上的出生日期非法')
                        return false
                    }
                    // 身份证号码校验
                    let sum = 0,
                        weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
                        codes = "10X98765432"
                    for (let i = 0; i < value.length - 1; i++) {
                        sum += parseInt(value[i]) * weights[i];
                    }
                    let last = codes[sum % 11]; //计算出来的最后一位身份证号码
                    if (value[value.length - 1] != last) {
                        // console.log('你输入的身份证号非法')
                        return false
                    }
                    return true
                },
            },
        });
    };
}