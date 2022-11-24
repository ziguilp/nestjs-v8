import { SetMetadata } from '@nestjs/common';
import { CaptchaVerifyEventType } from '../dto/base.dto';

export const CustomMetaName_Captcha = 'captcha_verify';

export const Captcha = (event: CaptchaVerifyEventType) => SetMetadata(CustomMetaName_Captcha, event);
