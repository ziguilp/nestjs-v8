import { forwardRef, Module } from '@nestjs/common';
import { PaymentModule } from 'src/payment/payment.module';
import { OrderService } from './service/order.service';

@Module({
    imports: [forwardRef(() => PaymentModule)],
    controllers: [],
    providers: [OrderService],
    exports: [OrderService]
})
export class OrderModule { }
