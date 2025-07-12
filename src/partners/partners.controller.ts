import {
  Controller,
  Get,
  Post,
  Body,
  PlainLiteralObject,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from 'src/common/dtos/create-partner.dto';
import { BaseController, BaseResponse } from 'src/common/base';

@Controller('partners')
export class PartnersController extends BaseController {
  constructor(private readonly partnersService: PartnersService) {
    super();
  }

  @Post('create')
  async create(
    @Body() createPartnerDto: CreatePartnerDto,
  ): Promise<BaseResponse<PlainLiteralObject>> {
    try {
      const res = await this.partnersService.create(createPartnerDto);
      return this.success(res);
    } catch (e) {
      return this.error(e);
    }
  }

  @Get('all')
  async findAll(): Promise<BaseResponse<PlainLiteralObject[]>> {
    try {
      const res = await this.partnersService.findAll();
      return this.success(res);
    } catch (e) {
      return this.error(e);
    }
  }
}
