import {
  Controller,
  Post,
  Body,
  PlainLiteralObject,
  Param,
  Get,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from '../common/dtos/create-slot.dto';
import { BaseController, BaseResponse } from '../common/base';

@Controller('slots')
export class SlotsController extends BaseController {
  constructor(private readonly slotsService: SlotsService) {
    super();
  }

  @Post('create')
  async create(
    @Body() createSlotDto: CreateSlotDto,
  ): Promise<BaseResponse<PlainLiteralObject>> {
    try {
      const res = await this.slotsService.create(createSlotDto);
      return this.success(res);
    } catch (e) {
      return this.error(e);
    }
  }

  @Get('/delete/:id')
  async remove(
    @Param('id') id: string,
  ): Promise<BaseResponse<PlainLiteralObject>> {
    try {
      console.log(id);
      const res = await this.slotsService.remove(id);
      return this.success(res);
    } catch (e) {
      return this.error(e);
    }
  }

  @Get('/all/:id')
  async findAll(
    @Param('id') id: string,
  ): Promise<BaseResponse<PlainLiteralObject>> {
    try {
      const res = await this.slotsService.findAll(id);
      return this.success(res);
    } catch (e) {
      return this.error(e);
    }
  }
}
