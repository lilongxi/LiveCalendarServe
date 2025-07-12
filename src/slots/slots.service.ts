import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSlotDto } from '../common/dtos/create-slot.dto';

@Injectable()
export class SlotsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createSlotDto: CreateSlotDto) {
    const { start_time, partner_id } = createSlotDto;
    const startTime = new Date(start_time);

    // 1. 验证 partner_id 是否存在
    const { data: partner, error: partnerError } = await this.supabaseService
      .getClient()
      .from('partners')
      .select('id')
      .eq('id', partner_id)
      .single();

    if (partnerError || !partner) {
      throw new NotFoundException(`Partner with ID "${partner_id}" not found.`);
    }

    // 2. 验证时间是否为15分钟的倍数
    if (
      startTime.getMinutes() % 15 !== 0 ||
      startTime.getSeconds() !== 0 ||
      startTime.getMilliseconds() !== 0
    ) {
      throw new BadRequestException(
        'Start time must be in 15-minute intervals.',
      );
    }

    // 3. 验证时间是否在 9:00 到 17:00 之间 (UTC 时间)
    const hours = startTime.getUTCHours();
    if (hours < 9 || hours >= 17) {
      throw new BadRequestException(
        'Start time must be between 09:00 and 17:00 UTC.',
      );
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('available_slots')
      .insert([{ partner_id, start_time }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          'This time slot has already been marked as available.',
        );
      }
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
