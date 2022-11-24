import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LogQueueService } from 'src/queue/producer/log.queue';

@Injectable()
export class TestTasksService {
    private readonly logger = new Logger(TestTasksService.name);

    constructor(private readonly logQueue: LogQueueService) {

    }

    @Cron('45 * * * * *')
    handleCron() {
        this.logger.debug('Called when the current second is 45');
    }
}
