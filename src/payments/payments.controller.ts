import { Controller, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';

@Controller('api/payment')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('success')
  async success(@Query('tran_id') tran_id: string, @Res() res: Response) {
    await this.paymentsService.handleSuccess(tran_id);
    return res.redirect(`http://localhost:3000/payment/success?tran_id=${tran_id}`);
  }

  @Post('fail')
  async fail(@Query('tran_id') tran_id: string, @Res() res: Response) {
    await this.paymentsService.handleFail(tran_id);
    return res.redirect(`http://localhost:3000/payment/fail?tran_id=${tran_id}`);
  }

  @Post('cancel')
  async cancel(@Query('tran_id') tran_id: string, @Res() res: Response) {
    await this.paymentsService.handleCancel(tran_id);
    return res.redirect(`http://localhost:3000/payment/fail?tran_id=${tran_id}&status=cancelled`);
  }
}
