import { Controller, Post, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('api/payment')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('success')
  async success(@Query('tran_id') tran_id: string) {
    return this.paymentsService.handleSuccess(tran_id);
  }

  @Post('fail')
  async fail(@Query('tran_id') tran_id: string) {
    return this.paymentsService.handleFail(tran_id);
  }

  @Post('cancel')
  async cancel(@Query('tran_id') tran_id: string) {
    return this.paymentsService.handleCancel(tran_id);
  }
}
