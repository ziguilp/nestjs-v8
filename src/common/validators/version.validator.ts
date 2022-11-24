import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export const isAppVersion = (version: string) => {
    return /^(\d+\.)(\d+)(\.\d+)?$/.test(version)
}

export const calcVersionVal = (version: string) => {
    return version.split(".").reduce((p: number, c: string, i: number) => {
        p += Number(c).mul(Math.pow(10, 2 - i))
        return p;
    }, 0);
}

/**
 * 版本v1是否大于v2
 * @param v1 
 * @param v2 
 * @returns 0:v1=v2， 1:v1>v2,  -1:v1<v2
 */
export const appVersionCompaire = (v1: string, v2: string) => {

    let v1v: number = calcVersionVal(v1)

    let v2v: number = calcVersionVal(v2)

    if (v1v === v2v) return 0;

    return v1v > v2v ? 1 : -1;
}

/**
 * 版本号格式判断
 * @param validationOptions 
 * @returns 
 */
export function IsAppVersion(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsAppVersion',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (!value || typeof value !== 'string') {
                        return false
                    }

                    if (!isAppVersion(value)) {
                        return false
                    }

                    return true
                },
            },
        });
    };
}