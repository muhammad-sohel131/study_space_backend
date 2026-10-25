import { Controller, All, Query, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';

@Controller('api/payment')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) { }

  private getFrontendUrl(): string {
    const url =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('CLIENT_URL') ||
      'http://localhost:3000';
    return url.replace(/\/+$/, '');
  }

  @All('success')
  async success(
    @Query('tran_id') queryTranId: string,
    @Body('tran_id') bodyTranId: string,
    @Res() res: Response,
  ) {
    const tran_id = queryTranId || bodyTranId;
    if (tran_id) {
      await this.paymentsService.handleSuccess(tran_id);
    }
    const frontendUrl = this.getFrontendUrl();
    return res.redirect(303, `${frontendUrl}/payment/success?tran_id=${tran_id || ''}`);
  }

  @All('fail')
  async fail(
    @Query('tran_id') queryTranId: string,
    @Body('tran_id') bodyTranId: string,
    @Res() res: Response,
  ) {
    const tran_id = queryTranId || bodyTranId;
    if (tran_id) {
      await this.paymentsService.handleFail(tran_id);
    }
    const frontendUrl = this.getFrontendUrl();
    return res.redirect(303, `${frontendUrl}/payment/fail?tran_id=${tran_id || ''}`);
  }

  @All('cancel')
  async cancel(
    @Query('tran_id') queryTranId: string,
    @Body('tran_id') bodyTranId: string,
    @Res() res: Response,
  ) {
    const tran_id = queryTranId || bodyTranId;
    if (tran_id) {
      await this.paymentsService.handleCancel(tran_id);
    }
    const frontendUrl = this.getFrontendUrl();
    return res.redirect(303, `${frontendUrl}/payment/fail?tran_id=${tran_id || ''}&status=cancelled`);
  }

  @All('ipn')
  async ipn(
    @Query('tran_id') queryTranId: string,
    @Body('tran_id') bodyTranId: string,
    @Res() res: Response,
  ) {
    const tran_id = queryTranId || bodyTranId;
    if (tran_id) {
      await this.paymentsService.handleSuccess(tran_id);
    }
    return res.status(200).send('IPN received');
  }
}

