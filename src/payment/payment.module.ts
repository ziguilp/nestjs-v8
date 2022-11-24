import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { OrderModule } from 'src/order/order.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './service/payment.service';

@Module({
    imports: [forwardRef(() => OrderModule), AuthModule],
    controllers: [PaymentController],
    providers: [PaymentService],
    exports: [PaymentService]
})
export class PaymentModule {

}
