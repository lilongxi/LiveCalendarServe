import {
  Controller,
  Get,
  Post,
  Body,
  PlainLiteralObject,
  Param,
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

  @Get('/share_link/:share_link_id')
  async findOneByShareLink(
    @Param('share_link_id') share_link_id: string,
  ): Promise<BaseResponse<PlainLiteralObject>> {
    try {
      const res = await this.partnersService.findByShareLinkId(share_link_id);
      return this.success(res);
    } catch (e) {
      return this.error(e);
    }
  }

  @Get('/partner/:id')
  async findOneById(
    @Param('id') id: string,
  ): Promise<BaseResponse<PlainLiteralObject>> {
    try {
      const res = await this.partnersService.findOneById(id);
      return this.success(res);
    } catch (e) {
      return this.error(e);
    }
  }
}
