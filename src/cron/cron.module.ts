import { Module } from '@nestjs/common';
import { QueueModule } from 'src/queue/queue.module';
import { TestTasksService } from './test.task';

@Module({
    imports: [QueueModule],
    providers: [TestTasksService],
})
export class TasksModule { }