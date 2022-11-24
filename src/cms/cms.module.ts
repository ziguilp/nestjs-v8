import { Module } from '@nestjs/common';
import { CmsController } from './controller/cms.controller';
import { CmsService } from './service/cms.service';

@Module({
    providers: [CmsService],
    exports: [CmsService],
    controllers: [CmsController]
})
export class CmsModule { }
