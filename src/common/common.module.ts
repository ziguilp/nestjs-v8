import { forwardRef, Module } from '@nestjs/common';
import { QueueModule } from 'src/queue/queue.module';
import { CommonController } from './controller/common.controller';
import { SystemMsgController } from './controller/systemmsg.controller';
import { AppVersionService } from './service/appVersion.service';
import { NotifyService } from './service/notify.service';
import { PrinterService } from './service/printer.service';
import { SystemMsgService } from './service/systemMsg.service';
@Module({
    imports: [
        forwardRef(() => QueueModule),
    ],
    controllers: [CommonController, SystemMsgController],
    providers: [NotifyService, PrinterService, SystemMsgService, AppVersionService],
    exports: [NotifyService, PrinterService, SystemMsgService, AppVersionService]
})
export class CommonModule { }
