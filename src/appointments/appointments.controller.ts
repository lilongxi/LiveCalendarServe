import {
  Controller,
  Post,
  Body,
  PlainLiteralObject,
  Param,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from 'src/common/dtos/create-appointment.dto';
import { BaseController, BaseResponse } from 'src/common/base';

@Controller('appointments')
export class AppointmentsController extends BaseController {
  constructor(private readonly appointmentsService: AppointmentsService) {
    super();
  }

  @Post('create')
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<BaseResponse<PlainLiteralObject>> {
    try {
      const res = await this.appointmentsService.create(createAppointmentDto);
      return this.success(res);
    } catch (e) {
      return this.error(e);
    }
  }

  @Post('/cancel/:id')
  async cancel(@Param('id') id: string): Promise<BaseResponse<boolean>> {
    try {
      const res = await this.appointmentsService.cancel(id);
      return this.success(!!res);
    } catch (e) {
      return this.error(e);
    }
  }
}
