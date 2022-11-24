import { isArray, isEmpty, isString } from "class-validator";
import { LkSMSConfig } from "src/config";
import * as _ from 'lodash';
import { MD5 } from 'crypto-js';
import { ServiceUnavailableException } from "@nestjs/common";
import * as moment from "moment";
import axios from "axios";
import * as QueryString from "qs";
import { XMLParser } from 'fast-xml-parser/src/fxp'

/**
 * LK短信发送
 */
export class LkSmsLibrary {

    private Uri = "http://47.93.25.215:8088/v2sms.aspx";

    private userId: string = "";

    private appId: string = "";

    private passwd: string = "";

    private messageSign: string = "";

    private message: string = "";

    private receivers: string[] = [];

    constructor() {
        this.userId = LkSMSConfig.userId;
        this.appId = LkSMSConfig.appId;
        this.passwd = LkSMSConfig.password;
        this.messageSign = `【${LkSMSConfig.sign.replace(/\【|\】/g, '')}】`;
    }

    setReceiver(receiver: string | string[]) {
        if (isString(receiver)) {
            receiver = [receiver]
        }
        this.receivers = _.uniq(receiver.concat(this.receivers))
        return this
    }

    setMessageContent(content: string) {
        this.message = content
        return this
    }

    async send() {
        if (isEmpty(this.receivers) || this.receivers.length < 1) {
            throw new ServiceUnavailableException("接收人为空");
        }
        if (isEmpty(this.message)) {
            throw new ServiceUnavailableException("消息内容为空");
        }
        const timeStamp = moment().utcOffset("+08").format('YYYYMMDDHHmmss')
        const body = {
            userid: this.userId,
            timestamp: timeStamp,
            mobile: this.receivers.join(","),
            content: this.message,
            sendTime: '',
            action: 'send',
            sign: MD5(`${this.appId}${this.passwd}${timeStamp}`).toString()
        }

        const res = await axios({
            url: this.Uri + `?${QueryString.stringify(body)}`,
            method: 'GET',
            // data: body,
            headers: {
                'useragent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.98 Safari/537.36'
            }
        })

        const sendRes = (new XMLParser()).parse(res.data)

        console.log(`短信发送`, sendRes)
        return sendRes.returnsms
    }
}