import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { WechatLogisticService } from './service/wechat-logistic.service';

@Module({
    imports: [AuthModule],
    providers: [WechatLogisticService]
})
export class LogisticModule { }
